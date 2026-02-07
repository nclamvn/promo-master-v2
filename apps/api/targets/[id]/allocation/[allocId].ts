import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

/**
 * /targets/:id/allocation/:allocId
 * GET - Get specific allocation
 * PUT - Update allocation (target value, notes)
 * DELETE - Delete allocation
 */

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

  const { id: targetId, allocId } = req.query as { id: string; allocId: string };
  if (!targetId || !allocId) {
    return res.status(400).json({ error: 'Missing target id or allocation id' });
  }

  try {
    // Verify allocation exists and belongs to this target
    const allocation = await prisma.targetAllocation.findUnique({
      where: { id: allocId },
      include: {
        target: true,
        geographicUnit: true,
        parent: true,
        children: { include: { geographicUnit: true } },
      },
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    if (allocation.targetId !== targetId) {
      return res.status(400).json({ error: 'Allocation does not belong to this target' });
    }

    if (req.method === 'GET') {
      const targetVal = Number(allocation.targetValue);
      const achievedVal = Number(allocation.achievedValue);

      return res.status(200).json({
        data: {
          ...allocation,
          targetValue: targetVal,
          achievedValue: achievedVal,
          childrenTarget: Number(allocation.childrenTarget),
          progressPercent: Number(allocation.progressPercent),
          progress: calculateProgress(achievedVal, targetVal),
        },
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { targetValue, notes, status } = req.body;

      const updateData: Record<string, unknown> = {};

      // Handle target value update
      if (targetValue !== undefined) {
        if (allocation.status !== 'DRAFT') {
          return res.status(400).json({
            error: 'Can only modify target value for DRAFT allocations',
          });
        }

        const newValue = Number(targetValue);
        const oldValue = Number(allocation.targetValue);
        const childrenTarget = Number(allocation.childrenTarget);
        const valueDiff = newValue - oldValue;

        // New value must cover children
        if (newValue < childrenTarget) {
          return res.status(400).json({
            error: `New value (${newValue}) is less than children total (${childrenTarget})`,
          });
        }

        // Check parent constraints
        if (allocation.parentId && allocation.parent) {
          const parentValue = Number(allocation.parent.targetValue);
          const parentChildren = Number(allocation.parent.childrenTarget);
          const parentRemaining = parentValue - parentChildren + oldValue;

          if (newValue > parentRemaining) {
            return res.status(400).json({
              error: `New value (${newValue}) exceeds parent remaining (${parentRemaining})`,
            });
          }

          // Update parent's childrenTarget
          await prisma.targetAllocation.update({
            where: { id: allocation.parentId },
            data: { childrenTarget: { increment: valueDiff } },
          });
        } else {
          // Root allocation - check total target
          const otherRootTotal = await prisma.targetAllocation.aggregate({
            where: { targetId, parentId: null, id: { not: allocId } },
            _sum: { targetValue: true },
          });
          const otherTotal = Number(otherRootTotal._sum.targetValue || 0);
          const totalTarget = Number(allocation.target.totalTarget);

          if (otherTotal + newValue > totalTarget) {
            return res.status(400).json({
              error: `Total root allocations (${otherTotal + newValue}) exceeds target total (${totalTarget})`,
            });
          }
        }

        updateData.targetValue = newValue;
      }

      if (notes !== undefined) updateData.notes = notes;

      if (status !== undefined) {
        const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        updateData.status = status;
      }

      const updated = await prisma.targetAllocation.update({
        where: { id: allocId },
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
      if (allocation.status !== 'DRAFT') {
        return res.status(400).json({
          error: 'Can only delete DRAFT allocations',
        });
      }

      if (allocation.children.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete allocation with children',
        });
      }

      const deletedValue = Number(allocation.targetValue);

      // Update parent's childrenTarget
      if (allocation.parentId) {
        await prisma.targetAllocation.update({
          where: { id: allocation.parentId },
          data: { childrenTarget: { decrement: deletedValue } },
        });
      }

      await prisma.targetAllocation.delete({ where: { id: allocId } });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Target allocation detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
