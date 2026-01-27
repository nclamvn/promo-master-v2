import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

// Helper function to generate allocation code
function generateAllocationCode(budgetCode: string, geoCode: string): string {
  return `BA-${budgetCode}-${geoCode}`;
}

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

  try {
    if (req.method === 'GET') {
      const { budgetId, tree, parentId, status, geographicUnitId } = req.query as Record<string, string>;

      // If tree=true and budgetId provided, return hierarchical allocation tree
      if (tree === 'true' && budgetId) {
        const rootAllocations = await prisma.budgetAllocation.findMany({
          where: { budgetId, parentId: null },
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

      if (budgetId) where.budgetId = budgetId;
      if (parentId) where.parentId = parentId;
      if (status) where.status = status;
      if (geographicUnitId) where.geographicUnitId = geographicUnitId;

      const allocations = await prisma.budgetAllocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          budget: { select: { id: true, code: true, name: true, totalAmount: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, allocatedAmount: true } },
          _count: { select: { children: true } },
        },
      });

      return res.status(200).json({ data: allocations });
    }

    if (req.method === 'POST') {
      const { budgetId, geographicUnitId, parentId, allocatedAmount, notes } = req.body;

      if (!budgetId || !geographicUnitId || allocatedAmount === undefined) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: budgetId, geographicUnitId, allocatedAmount' });
      }

      // Validate budget exists
      const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
      if (!budget) {
        return res.status(400).json({ error: 'Ngân sách không tồn tại' });
      }

      // Validate geographic unit exists
      const geoUnit = await prisma.geographicUnit.findUnique({ where: { id: geographicUnitId } });
      if (!geoUnit) {
        return res.status(400).json({ error: 'Đơn vị địa lý không tồn tại' });
      }

      // Check for existing allocation for this budget + geo combo
      const existing = await prisma.budgetAllocation.findUnique({
        where: { budgetId_geographicUnitId: { budgetId, geographicUnitId } },
      });
      if (existing) {
        return res.status(400).json({ error: 'Đã có phân bổ cho đơn vị địa lý này trong ngân sách' });
      }

      // Validate parent allocation if provided
      let parentAllocation = null;
      if (parentId) {
        parentAllocation = await prisma.budgetAllocation.findUnique({ where: { id: parentId } });
        if (!parentAllocation) {
          return res.status(400).json({ error: 'Phân bổ cha không tồn tại' });
        }
        if (parentAllocation.budgetId !== budgetId) {
          return res.status(400).json({ error: 'Phân bổ cha không thuộc cùng ngân sách' });
        }

        // Check if amount exceeds parent's available
        const parentAvailable = parseFloat(parentAllocation.availableToAllocate.toString());
        if (parseFloat(allocatedAmount) > parentAvailable) {
          return res.status(400).json({
            error: `Số tiền phân bổ (${allocatedAmount}) vượt quá số khả dụng của cha (${parentAvailable})`,
          });
        }
      } else {
        // Root allocation - check against budget total
        const currentRootAllocations = await prisma.budgetAllocation.aggregate({
          where: { budgetId, parentId: null },
          _sum: { allocatedAmount: true },
        });
        const totalRootAllocated = parseFloat(currentRootAllocations._sum.allocatedAmount?.toString() || '0');
        const budgetTotal = parseFloat(budget.totalAmount.toString());

        if (totalRootAllocated + parseFloat(allocatedAmount) > budgetTotal) {
          return res.status(400).json({
            error: `Tổng phân bổ gốc (${totalRootAllocated + parseFloat(allocatedAmount)}) vượt quá tổng ngân sách (${budgetTotal})`,
          });
        }
      }

      // Generate code
      const code = generateAllocationCode(budget.code, geoUnit.code);

      // Create allocation
      const allocation = await prisma.budgetAllocation.create({
        data: {
          code,
          budgetId,
          geographicUnitId,
          parentId: parentId || null,
          allocatedAmount: parseFloat(allocatedAmount),
          availableToAllocate: parseFloat(allocatedAmount),
          notes: notes || null,
          createdBy: user.userId,
        },
        include: {
          budget: { select: { id: true, code: true, name: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      // Update parent's childrenAllocated and availableToAllocate
      if (parentId && parentAllocation) {
        const newChildrenAllocated = parseFloat(parentAllocation.childrenAllocated.toString()) + parseFloat(allocatedAmount);
        await prisma.budgetAllocation.update({
          where: { id: parentId },
          data: {
            childrenAllocated: newChildrenAllocated,
            availableToAllocate: calculateAvailable(
              parseFloat(parentAllocation.allocatedAmount.toString()),
              newChildrenAllocated
            ),
          },
        });
      }

      // Update budget's allocatedAmount
      await prisma.budget.update({
        where: { id: budgetId },
        data: {
          allocatedAmount: {
            increment: parseFloat(allocatedAmount),
          },
        },
      });

      return res.status(201).json({ data: allocation });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budget Allocations error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
