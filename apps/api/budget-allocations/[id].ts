import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

// Helper to calculate available amount
function calculateAvailable(allocated: number, childrenAllocated: number): number {
  return Math.max(0, allocated - childrenAllocated);
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

      const allocation = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: {
          budget: { select: { id: true, code: true, name: true, totalAmount: true, year: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, allocatedAmount: true, geographicUnit: true } },
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
        return res.status(404).json({ error: 'Không tìm thấy phân bổ ngân sách' });
      }

      return res.status(200).json({ data: allocation });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { allocatedAmount, notes, status } = req.body;

      const existing = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: { parent: true, budget: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy phân bổ ngân sách' });
      }

      // Check status - only DRAFT can be modified
      if (existing.status !== 'DRAFT' && allocatedAmount !== undefined) {
        return res.status(400).json({ error: 'Chỉ có thể sửa phân bổ ở trạng thái DRAFT' });
      }

      const updateData: Record<string, unknown> = {};

      // Handle amount update
      if (allocatedAmount !== undefined) {
        const newAmount = parseFloat(allocatedAmount);
        const oldAmount = parseFloat(existing.allocatedAmount.toString());
        const childrenAllocated = parseFloat(existing.childrenAllocated.toString());
        const amountDiff = newAmount - oldAmount;

        // New amount must cover children allocations
        if (newAmount < childrenAllocated) {
          return res.status(400).json({
            error: `Số tiền mới (${newAmount}) không đủ cho phân bổ con (${childrenAllocated})`,
          });
        }

        // If has parent, check parent's available
        if (existing.parentId && existing.parent) {
          const parentAvailable = parseFloat(existing.parent.availableToAllocate.toString());
          if (amountDiff > parentAvailable) {
            return res.status(400).json({
              error: `Số tiền tăng thêm (${amountDiff}) vượt quá số khả dụng của cha (${parentAvailable})`,
            });
          }

          // Update parent's childrenAllocated
          await prisma.budgetAllocation.update({
            where: { id: existing.parentId },
            data: {
              childrenAllocated: { increment: amountDiff },
              availableToAllocate: { decrement: amountDiff },
            },
          });
        } else {
          // Root allocation - check budget total
          const currentTotal = parseFloat(existing.budget.allocatedAmount.toString());
          const budgetTotal = parseFloat(existing.budget.totalAmount.toString());
          if (currentTotal + amountDiff > budgetTotal) {
            return res.status(400).json({
              error: `Tổng phân bổ (${currentTotal + amountDiff}) vượt quá tổng ngân sách (${budgetTotal})`,
            });
          }
        }

        // Update budget's allocatedAmount
        await prisma.budget.update({
          where: { id: existing.budgetId },
          data: { allocatedAmount: { increment: amountDiff } },
        });

        updateData.allocatedAmount = newAmount;
        updateData.availableToAllocate = calculateAvailable(newAmount, childrenAllocated);
      }

      if (notes !== undefined) updateData.notes = notes;

      // Handle status update
      if (status !== undefined) {
        const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        updateData.status = status;

        if (status === 'APPROVED') {
          updateData.approvedBy = user.userId;
          updateData.approvedAt = new Date();
        }
      }

      const updated = await prisma.budgetAllocation.update({
        where: { id },
        data: updateData,
        include: {
          budget: { select: { id: true, code: true, name: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({ data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: { _count: { select: { children: true } }, parent: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy phân bổ ngân sách' });
      }

      // Check status - only DRAFT can be deleted
      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Chỉ có thể xóa phân bổ ở trạng thái DRAFT' });
      }

      // Check for children
      if (existing._count.children > 0) {
        return res.status(400).json({ error: 'Không thể xóa vì có phân bổ con' });
      }

      const deletedAmount = parseFloat(existing.allocatedAmount.toString());

      // Update parent's childrenAllocated if has parent
      if (existing.parentId && existing.parent) {
        await prisma.budgetAllocation.update({
          where: { id: existing.parentId },
          data: {
            childrenAllocated: { decrement: deletedAmount },
            availableToAllocate: { increment: deletedAmount },
          },
        });
      }

      // Update budget's allocatedAmount
      await prisma.budget.update({
        where: { id: existing.budgetId },
        data: { allocatedAmount: { decrement: deletedAmount } },
      });

      await prisma.budgetAllocation.delete({ where: { id } });

      return res.status(200).json({ message: 'Đã xóa phân bổ ngân sách' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budget Allocation error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
