import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

// Helper function to generate allocation code
function generateAllocationCode(targetCode: string, geoCode: string): string {
  return `TA-${targetCode}-${geoCode}`;
}

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

  try {
    if (req.method === 'GET') {
      const { targetId, tree, parentId, status, geographicUnitId } = req.query as Record<string, string>;

      // If tree=true and targetId provided, return hierarchical allocation tree
      if (tree === 'true' && targetId) {
        const rootAllocations = await prisma.targetAllocation.findMany({
          where: { targetId, parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            geographicUnit: true,
            children: {
              orderBy: { createdAt: 'asc' },
              include: {
                geographicUnit: true,
                children: {
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
                },
              },
            },
          },
        });

        return res.status(200).json({ data: rootAllocations });
      }

      // Regular list query
      const where: Record<string, unknown> = {};

      if (targetId) where.targetId = targetId;
      if (parentId) where.parentId = parentId;
      if (status) where.status = status;
      if (geographicUnitId) where.geographicUnitId = geographicUnitId;

      const allocations = await prisma.targetAllocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          target: { select: { id: true, code: true, name: true, totalTarget: true, metric: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, targetValue: true } },
          _count: { select: { children: true } },
        },
      });

      return res.status(200).json({ data: allocations });
    }

    if (req.method === 'POST') {
      const { targetId, geographicUnitId, parentId, targetValue, metric, notes } = req.body;

      if (!targetId || !geographicUnitId || targetValue === undefined) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: targetId, geographicUnitId, targetValue' });
      }

      // Validate target exists
      const target = await prisma.target.findUnique({ where: { id: targetId } });
      if (!target) {
        return res.status(400).json({ error: 'Mục tiêu không tồn tại' });
      }

      // Validate geographic unit exists
      const geoUnit = await prisma.geographicUnit.findUnique({ where: { id: geographicUnitId } });
      if (!geoUnit) {
        return res.status(400).json({ error: 'Đơn vị địa lý không tồn tại' });
      }

      // Check for existing allocation for this target + geo combo
      const existing = await prisma.targetAllocation.findUnique({
        where: { targetId_geographicUnitId: { targetId, geographicUnitId } },
      });
      if (existing) {
        return res.status(400).json({ error: 'Đã có phân bổ cho đơn vị địa lý này trong mục tiêu' });
      }

      // Validate parent allocation if provided
      let parentAllocation = null;
      if (parentId) {
        parentAllocation = await prisma.targetAllocation.findUnique({ where: { id: parentId } });
        if (!parentAllocation) {
          return res.status(400).json({ error: 'Phân bổ cha không tồn tại' });
        }
        if (parentAllocation.targetId !== targetId) {
          return res.status(400).json({ error: 'Phân bổ cha không thuộc cùng mục tiêu' });
        }

        // Check if value exceeds parent's remaining target
        const parentValue = parseFloat(parentAllocation.targetValue.toString());
        const childrenTarget = parseFloat(parentAllocation.childrenTarget.toString());
        const parentRemaining = parentValue - childrenTarget;

        if (parseFloat(targetValue) > parentRemaining) {
          return res.status(400).json({
            error: `Giá trị mục tiêu (${targetValue}) vượt quá số còn lại của cha (${parentRemaining})`,
          });
        }
      } else {
        // Root allocation - check against target total
        const currentRootAllocations = await prisma.targetAllocation.aggregate({
          where: { targetId, parentId: null },
          _sum: { targetValue: true },
        });
        const totalRootTarget = parseFloat(currentRootAllocations._sum.targetValue?.toString() || '0');
        const totalTarget = parseFloat(target.totalTarget.toString());

        if (totalRootTarget + parseFloat(targetValue) > totalTarget) {
          return res.status(400).json({
            error: `Tổng mục tiêu gốc (${totalRootTarget + parseFloat(targetValue)}) vượt quá tổng mục tiêu (${totalTarget})`,
          });
        }
      }

      // Generate code
      const code = generateAllocationCode(target.code, geoUnit.code);

      // Create allocation
      const allocation = await prisma.targetAllocation.create({
        data: {
          code,
          targetId,
          geographicUnitId,
          parentId: parentId || null,
          targetValue: parseFloat(targetValue),
          metric: metric || target.metric,
          notes: notes || null,
          createdBy: user.userId,
        },
        include: {
          target: { select: { id: true, code: true, name: true, metric: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      // Update parent's childrenTarget
      if (parentId && parentAllocation) {
        const newChildrenTarget = parseFloat(parentAllocation.childrenTarget.toString()) + parseFloat(targetValue);
        await prisma.targetAllocation.update({
          where: { id: parentId },
          data: { childrenTarget: newChildrenTarget },
        });
      }

      return res.status(201).json({ data: allocation });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Target Allocations error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
