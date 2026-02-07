import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * /targets/:id/allocation
 * GET - Get allocation tree for a target
 * POST - Create new allocation for this target
 */

function generateAllocationCode(targetCode: string, geoCode: string): string {
  return `TA-${targetCode}-${geoCode}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id: targetId } = req.query as { id: string };
  if (!targetId) return res.status(400).json({ error: 'Missing target id' });

  try {
    // Verify target exists
    const target = await prisma.target.findUnique({ where: { id: targetId } });
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    if (req.method === 'GET') {
      // Get hierarchical allocation tree
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

      // Calculate summary
      const allAllocations = await prisma.targetAllocation.findMany({
        where: { targetId },
      });

      const totalAllocated = allAllocations.reduce(
        (sum, a) => sum + Number(a.targetValue), 0
      );
      const totalAchieved = allAllocations.reduce(
        (sum, a) => sum + Number(a.achievedValue), 0
      );

      return res.status(200).json({
        data: rootAllocations,
        summary: {
          totalTarget: Number(target.totalTarget),
          totalAllocated,
          totalAchieved,
          unallocated: Number(target.totalTarget) - totalAllocated,
          overallProgress: Number(target.totalTarget) > 0
            ? Math.round((totalAchieved / Number(target.totalTarget)) * 1000) / 10
            : 0,
        },
      });
    }

    if (req.method === 'POST') {
      const { geographicUnitId, parentId, targetValue, metric, notes } = req.body;

      if (!geographicUnitId || targetValue === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: geographicUnitId, targetValue',
        });
      }

      // Validate geographic unit
      const geoUnit = await prisma.geographicUnit.findUnique({
        where: { id: geographicUnitId },
      });
      if (!geoUnit) {
        return res.status(400).json({ error: 'Geographic unit not found' });
      }

      // Check for existing allocation
      const existing = await prisma.targetAllocation.findUnique({
        where: { targetId_geographicUnitId: { targetId, geographicUnitId } },
      });
      if (existing) {
        return res.status(400).json({
          error: 'Allocation already exists for this geographic unit',
        });
      }

      // Validate parent allocation if provided
      let parentAllocation = null;
      if (parentId) {
        parentAllocation = await prisma.targetAllocation.findUnique({
          where: { id: parentId },
        });
        if (!parentAllocation) {
          return res.status(400).json({ error: 'Parent allocation not found' });
        }
        if (parentAllocation.targetId !== targetId) {
          return res.status(400).json({
            error: 'Parent allocation belongs to different target',
          });
        }

        // Check if value exceeds parent's remaining
        const parentValue = Number(parentAllocation.targetValue);
        const childrenTarget = Number(parentAllocation.childrenTarget);
        const parentRemaining = parentValue - childrenTarget;

        if (Number(targetValue) > parentRemaining) {
          return res.status(400).json({
            error: `Target value (${targetValue}) exceeds parent remaining (${parentRemaining})`,
          });
        }
      } else {
        // Root allocation - check against target total
        const currentRootTotal = await prisma.targetAllocation.aggregate({
          where: { targetId, parentId: null },
          _sum: { targetValue: true },
        });
        const totalRootTarget = Number(currentRootTotal._sum.targetValue || 0);
        const totalTarget = Number(target.totalTarget);

        if (totalRootTarget + Number(targetValue) > totalTarget) {
          return res.status(400).json({
            error: `Total root allocations (${totalRootTarget + Number(targetValue)}) exceeds target total (${totalTarget})`,
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
          targetValue: Number(targetValue),
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
        const newChildrenTarget = Number(parentAllocation.childrenTarget) + Number(targetValue);
        await prisma.targetAllocation.update({
          where: { id: parentId },
          data: { childrenTarget: newChildrenTarget },
        });
      }

      return res.status(201).json({ data: allocation });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Target allocation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
