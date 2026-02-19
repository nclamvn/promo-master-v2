import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * /fund-activities
 * GET - List fund activities with filtering
 * POST - Create new fund activity (link budget to activity)
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const {
        budgetId,
        budgetAllocationId,
        activityType,
        status,
        promotionId,
        page = '1',
        pageSize = '20',
      } = req.query;

      const skip = (Number(page) - 1) * Number(pageSize);
      const take = Number(pageSize);

      const where: Record<string, unknown> = {};
      if (budgetId) where.budgetId = budgetId;
      if (budgetAllocationId) where.budgetAllocationId = budgetAllocationId;
      if (activityType) where.activityType = activityType;
      if (status) where.status = status;
      if (promotionId) where.promotionId = promotionId;

      const [activities, total] = await Promise.all([
        prisma.fundActivity.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            budget: {
              select: { id: true, code: true, name: true, totalAmount: true },
            },
            budgetAllocation: {
              select: { id: true, code: true, allocatedAmount: true },
            },
          },
        }),
        prisma.fundActivity.count({ where }),
      ]);

      // Transform decimal fields
      const transformed = activities.map((a) => ({
        ...a,
        allocatedAmount: Number(a.allocatedAmount),
        spentAmount: Number(a.spentAmount),
        revenueGenerated: a.revenueGenerated ? Number(a.revenueGenerated) : null,
        roi: a.roi ? Number(a.roi) : null,
        budget: a.budget
          ? {
              ...a.budget,
              totalAmount: Number(a.budget.totalAmount),
            }
          : null,
        budgetAllocation: a.budgetAllocation
          ? {
              ...a.budgetAllocation,
              allocatedAmount: Number(a.budgetAllocation.allocatedAmount),
            }
          : null,
      }));

      return res.status(200).json({
        data: transformed,
        metadata: {
          total,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(total / Number(pageSize)),
        },
      });
    }

    if (req.method === 'POST') {
      const {
        budgetId,
        budgetAllocationId,
        promotionId,
        activityType,
        activityName,
        activityCode,
        allocatedAmount,
        startDate,
        endDate,
        notes,
      } = req.body;

      // Validate required fields
      if (!budgetId || !activityType || !activityName || allocatedAmount === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: budgetId, activityType, activityName, allocatedAmount',
        });
      }

      // Validate budget exists
      const budget = await prisma.budget.findUnique({
        where: { id: budgetId },
      });
      if (!budget) {
        return res.status(400).json({ error: 'Budget not found' });
      }

      // Validate allocation if provided
      if (budgetAllocationId) {
        const allocation = await prisma.budgetAllocation.findUnique({
          where: { id: budgetAllocationId },
        });
        if (!allocation) {
          return res.status(400).json({ error: 'Budget allocation not found' });
        }
        if (allocation.budgetId !== budgetId) {
          return res.status(400).json({
            error: 'Allocation does not belong to specified budget',
          });
        }
      }

      // Validate activity type
      const validTypes = ['promotion', 'display', 'sampling', 'event', 'listing_fee'];
      if (!validTypes.includes(activityType)) {
        return res.status(400).json({
          error: `Invalid activity type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      // Create activity
      const activity = await prisma.fundActivity.create({
        data: {
          budgetId,
          budgetAllocationId: budgetAllocationId || null,
          promotionId: promotionId || null,
          activityType,
          activityName,
          activityCode: activityCode || null,
          allocatedAmount: Number(allocatedAmount),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(),
          notes: notes || null,
          createdBy: user.userId,
        },
        include: {
          budget: {
            select: { id: true, code: true, name: true },
          },
          budgetAllocation: {
            select: { id: true, code: true },
          },
        },
      });

      return res.status(201).json({
        data: {
          ...activity,
          allocatedAmount: Number(activity.allocatedAmount),
          spentAmount: Number(activity.spentAmount),
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Fund activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
