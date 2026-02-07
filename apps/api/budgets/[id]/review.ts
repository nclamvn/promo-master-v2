import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * POST /budgets/:id/review
 * Review a budget (approve, reject, or request revision)
 *
 * Body:
 * - action: 'approve' | 'reject' | 'revision_needed'
 * - comments: string (optional, but required for reject/revision_needed)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing budget id' });

  const { action, comments } = req.body;

  // Validation
  if (!action || !['approve', 'reject', 'revision_needed'].includes(action)) {
    return res.status(400).json({
      error: 'Invalid action. Must be "approve", "reject", or "revision_needed"'
    });
  }

  if ((action === 'reject' || action === 'revision_needed') && !comments) {
    return res.status(400).json({
      error: 'Comments are required when rejecting or requesting revision'
    });
  }

  try {
    // Get budget with current approval
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        approvals: { orderBy: { submittedAt: 'desc' }, take: 1 },
      },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Validate: Can only review SUBMITTED or UNDER_REVIEW budgets
    if (budget.approvalStatus !== 'SUBMITTED' && budget.approvalStatus !== 'UNDER_REVIEW') {
      return res.status(400).json({
        error: `Cannot review budget with status "${budget.approvalStatus}". Budget must be SUBMITTED or UNDER_REVIEW.`
      });
    }

    // Get current pending approval
    const currentApproval = budget.approvals[0];
    if (!currentApproval || currentApproval.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ error: 'No pending approval found for this budget' });
    }

    // Get reviewer info
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    const reviewerName = userRecord?.name || 'Unknown User';

    const roleMap: Record<number, string> = {
      1: 'KAM Manager',
      2: 'Trade Marketing Manager',
      3: 'Finance Director',
    };

    // Map action to status
    const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'> = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      revision_needed: 'REVISION_NEEDED',
    };

    // Update current approval record
    await prisma.budgetApproval.update({
      where: { id: currentApproval.id },
      data: {
        status: statusMap[action],
        reviewerId: user.userId,
        reviewerName,
        comments,
        reviewedAt: new Date(),
      },
    });

    let updatedBudget;
    let message: string;

    if (action === 'approve') {
      const nextLevel = currentApproval.level + 1;

      if (nextLevel <= budget.approvalLevel) {
        // More approvals needed
        await prisma.budgetApproval.create({
          data: {
            budgetId: id,
            level: nextLevel,
            role: roleMap[nextLevel],
            status: 'UNDER_REVIEW',
            submittedAt: new Date(),
          },
        });

        updatedBudget = await prisma.budget.update({
          where: { id },
          data: {
            approvalStatus: 'UNDER_REVIEW',
            currentLevel: nextLevel,
          },
          include: { approvals: { orderBy: { submittedAt: 'desc' } } },
        });

        message = `Level ${currentApproval.level} approved by ${reviewerName}. Awaiting review from ${roleMap[nextLevel]}.`;
      } else {
        // All levels approved - final approval
        updatedBudget = await prisma.budget.update({
          where: { id },
          data: {
            approvalStatus: 'APPROVED',
            status: 'ACTIVE', // Also activate the budget
          },
          include: { approvals: { orderBy: { submittedAt: 'desc' } } },
        });

        message = `Budget fully approved! All ${budget.approvalLevel} level(s) completed.`;
      }
    } else if (action === 'reject') {
      updatedBudget = await prisma.budget.update({
        where: { id },
        data: {
          approvalStatus: 'REJECTED',
        },
        include: { approvals: { orderBy: { submittedAt: 'desc' } } },
      });

      message = `Budget rejected by ${reviewerName}. Reason: ${comments}`;
    } else {
      // revision_needed
      updatedBudget = await prisma.budget.update({
        where: { id },
        data: {
          approvalStatus: 'REVISION_NEEDED',
          currentLevel: 0, // Reset level for resubmission
        },
        include: { approvals: { orderBy: { submittedAt: 'desc' } } },
      });

      message = `Revision requested by ${reviewerName}. Please address: ${comments}`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: {
        ...updatedBudget,
        totalAmount: Number(updatedBudget.totalAmount),
        allocatedAmount: Number(updatedBudget.allocatedAmount),
        spentAmount: Number(updatedBudget.spentAmount),
        workflow: {
          currentLevel: updatedBudget.currentLevel,
          requiredLevels: updatedBudget.approvalLevel,
          status: updatedBudget.approvalStatus,
        },
      },
    });
  } catch (error) {
    console.error('Review budget error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
