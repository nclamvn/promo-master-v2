import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

// Helper to calculate progress percent
function calculateProgress(achieved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (achieved / target) * 100);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    if (req.method === 'GET') {
      const { includeTree } = req.query as Record<string, string>;

      const allocation = await prisma.targetAllocation.findUnique({
        where: { id },
        include: {
          target: { select: { id: true, code: true, name: true, totalTarget: true, metric: true, year: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, targetValue: true, geographicUnit: true } },
          children: includeTree === 'true' ? {
            orderBy: { createdAt: 'asc' },
            include: {
              geographicUnit: true,
              children: {
                orderBy: { createdAt: 'asc' },
                include: {
                  geographicUnit: true,
                  children: {
                    orderBy: { createdAt: 'asc' },
                    include: { geographicUnit: true },
                  },
                },
              },
            },
          } : {
            orderBy: { createdAt: 'asc' },
            include: { geographicUnit: true },
          },
        },
      });

      if (!allocation) {
        return res.status(404).json({ error: 'Không tìm thấy phân bổ mục tiêu' });
      }

      return res.status(200).json({ data: allocation });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { targetValue, achievedValue, notes, status } = req.body;

      const existing = await prisma.targetAllocation.findUnique({
        where: { id },
        include: { parent: true, target: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy phân bổ mục tiêu' });
      }

      const updateData: Record<string, unknown> = {};

      // Handle target value update
      if (targetValue !== undefined) {
        // Check status - only DRAFT can have target modified
        if (existing.status !== 'DRAFT') {
          return res.status(400).json({ error: 'Chỉ có thể sửa mục tiêu ở trạng thái DRAFT' });
        }

        const newValue = parseFloat(targetValue);
        const oldValue = parseFloat(existing.targetValue.toString());
        const childrenTarget = parseFloat(existing.childrenTarget.toString());
        const valueDiff = newValue - oldValue;

        // New value must cover children targets
        if (newValue < childrenTarget) {
          return res.status(400).json({
            error: `Giá trị mới (${newValue}) không đủ cho phân bổ con (${childrenTarget})`,
          });
        }

        // If has parent, check parent's remaining
        if (existing.parentId && existing.parent) {
          const parentValue = parseFloat(existing.parent.targetValue.toString());
          const parentChildrenTarget = parseFloat(existing.parent.childrenTarget.toString());
          const parentRemaining = parentValue - parentChildrenTarget + oldValue;

          if (newValue > parentRemaining) {
            return res.status(400).json({
              error: `Giá trị mới (${newValue}) vượt quá số còn lại của cha (${parentRemaining})`,
            });
          }

          // Update parent's childrenTarget
          await prisma.targetAllocation.update({
            where: { id: existing.parentId },
            data: { childrenTarget: { increment: valueDiff } },
          });
        } else {
          // Root allocation - check total target
          const currentRootTotal = await prisma.targetAllocation.aggregate({
            where: { targetId: existing.targetId, parentId: null, id: { not: id } },
            _sum: { targetValue: true },
          });
          const otherRootTotal = parseFloat(currentRootTotal._sum.targetValue?.toString() || '0');
          const totalTarget = parseFloat(existing.target.totalTarget.toString());

          if (otherRootTotal + newValue > totalTarget) {
            return res.status(400).json({
              error: `Tổng mục tiêu gốc (${otherRootTotal + newValue}) vượt quá tổng mục tiêu (${totalTarget})`,
            });
          }
        }

        updateData.targetValue = newValue;
      }

      // Handle achieved value update
      if (achievedValue !== undefined) {
        const newAchieved = parseFloat(achievedValue);
        updateData.achievedValue = newAchieved;

        const targetVal = targetValue !== undefined
          ? parseFloat(targetValue)
          : parseFloat(existing.targetValue.toString());
        updateData.progressPercent = calculateProgress(newAchieved, targetVal);

        // Update parent's totalAchieved (propagate up)
        if (existing.targetId) {
          const allAllocations = await prisma.targetAllocation.findMany({
            where: { targetId: existing.targetId },
          });

          const totalAchieved = allAllocations.reduce((sum, alloc) => {
            if (alloc.id === id) {
              return sum + newAchieved;
            }
            return sum + parseFloat(alloc.achievedValue.toString());
          }, 0);

          await prisma.target.update({
            where: { id: existing.targetId },
            data: { totalAchieved },
          });
        }
      }

      if (notes !== undefined) updateData.notes = notes;

      // Handle status update
      if (status !== undefined) {
        const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }
        updateData.status = status;
      }

      const updated = await prisma.targetAllocation.update({
        where: { id },
        data: updateData,
        include: {
          target: { select: { id: true, code: true, name: true, metric: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({ data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.targetAllocation.findUnique({
        where: { id },
        include: { _count: { select: { children: true } }, parent: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy phân bổ mục tiêu' });
      }

      // Check status - only DRAFT can be deleted
      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Chỉ có thể xóa phân bổ ở trạng thái DRAFT' });
      }

      // Check for children
      if (existing._count.children > 0) {
        return res.status(400).json({ error: 'Không thể xóa vì có phân bổ con' });
      }

      const deletedValue = parseFloat(existing.targetValue.toString());

      // Update parent's childrenTarget if has parent
      if (existing.parentId && existing.parent) {
        await prisma.targetAllocation.update({
          where: { id: existing.parentId },
          data: { childrenTarget: { decrement: deletedValue } },
        });
      }

      await prisma.targetAllocation.delete({ where: { id } });

      return res.status(200).json({ message: 'Đã xóa phân bổ mục tiêu' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Target Allocation error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
