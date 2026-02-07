import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    if (req.method === 'GET') {
      const budget = await prisma.budget.findUnique({
        where: { id },
        include: {
          company: { select: { id: true, name: true, code: true } },
          allocations: {
            orderBy: { createdAt: 'desc' },
            include: {
              geographicUnit: { select: { id: true, code: true, name: true, level: true } },
            },
            take: 50,
          },
          approvals: {
            orderBy: { submittedAt: 'desc' },
          },
          activities: {
            orderBy: { startDate: 'desc' },
            take: 20,
          },
          previousPeriod: {
            select: {
              id: true,
              code: true,
              name: true,
              year: true,
              quarter: true,
              totalAmount: true,
              spentAmount: true,
            },
          },
        },
      });

      if (!budget) return res.status(404).json({ error: 'Budget not found' });

      // Calculate metrics
      const totalAmount = Number(budget.totalAmount);
      const allocatedAmount = Number(budget.allocatedAmount);
      const spentAmount = Number(budget.spentAmount);

      return res.status(200).json({
        data: {
          ...budget,
          totalAmount,
          allocatedAmount,
          spentAmount,
          // Calculated metrics
          utilizationRate: totalAmount > 0 ? Math.round((spentAmount / totalAmount) * 100) : 0,
          allocationRate: totalAmount > 0 ? Math.round((allocatedAmount / totalAmount) * 100) : 0,
          availableAmount: totalAmount - allocatedAmount,
          remainingAmount: totalAmount - spentAmount,
          // Previous period comparison (if exists)
          comparison: budget.previousPeriod ? {
            previousTotalAmount: Number(budget.previousPeriod.totalAmount),
            previousSpentAmount: Number(budget.previousPeriod.spentAmount),
            amountChange: totalAmount - Number(budget.previousPeriod.totalAmount),
            amountChangePercent: Number(budget.previousPeriod.totalAmount) > 0
              ? Math.round(((totalAmount - Number(budget.previousPeriod.totalAmount)) / Number(budget.previousPeriod.totalAmount)) * 100)
              : null,
          } : null,
        }
      });
    }

    if (req.method === 'PUT') {
      const {
        name,
        description,
        category,
        fundType,
        quarter,
        startDate,
        endDate,
        totalAmount,
        constraints,
        isActive,
      } = req.body;

      // Get current budget to check status
      const currentBudget = await prisma.budget.findUnique({ where: { id } });
      if (!currentBudget) return res.status(404).json({ error: 'Budget not found' });

      // Only allow editing DRAFT budgets (or specific fields for non-draft)
      if (currentBudget.approvalStatus !== 'DRAFT' && totalAmount !== undefined) {
        return res.status(400).json({
          error: 'Cannot modify totalAmount for non-DRAFT budgets. Submit a reallocation request.'
        });
      }

      // Build update data
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (fundType !== undefined) updateData.fundType = fundType;
      if (quarter !== undefined) updateData.quarter = quarter ? parseInt(quarter) : null;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (constraints !== undefined) updateData.constraints = constraints;
      if (isActive !== undefined) updateData.isActive = isActive;

      // Handle totalAmount update (only for DRAFT)
      if (totalAmount !== undefined && currentBudget.approvalStatus === 'DRAFT') {
        const amount = parseFloat(totalAmount);
        updateData.totalAmount = amount;

        // Recalculate approval level
        let approvalLevel = 1;
        if (amount >= 500_000_000_000) {
          approvalLevel = 3;
        } else if (amount >= 100_000_000_000) {
          approvalLevel = 2;
        }
        updateData.approvalLevel = approvalLevel;
      }

      const budget = await prisma.budget.update({
        where: { id },
        data: updateData,
        include: {
          company: { select: { id: true, name: true, code: true } },
        },
      });

      return res.status(200).json({
        data: {
          ...budget,
          totalAmount: Number(budget.totalAmount),
          allocatedAmount: Number(budget.allocatedAmount),
          spentAmount: Number(budget.spentAmount),
        }
      });
    }

    if (req.method === 'DELETE') {
      // Get current budget to check status
      const currentBudget = await prisma.budget.findUnique({
        where: { id },
        include: { _count: { select: { allocations: true } } },
      });

      if (!currentBudget) return res.status(404).json({ error: 'Budget not found' });

      // Only allow deleting DRAFT budgets with no allocations
      if (currentBudget.approvalStatus !== 'DRAFT') {
        return res.status(400).json({
          error: 'Cannot delete non-DRAFT budgets. Deactivate instead.'
        });
      }

      if (currentBudget._count.allocations > 0) {
        return res.status(400).json({
          error: 'Cannot delete budget with existing allocations. Remove allocations first.'
        });
      }

      await prisma.budget.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budget detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
