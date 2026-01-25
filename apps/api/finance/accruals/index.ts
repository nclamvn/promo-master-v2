import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', status, promotionId, period } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (promotionId) where.promotionId = promotionId;
      if (period) where.period = period;

      const [accruals, total, summaryData] = await Promise.all([
        prisma.accrualEntry.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            promotion: { select: { id: true, code: true, name: true, budget: true } },
            createdBy: { select: { id: true, name: true } },
          },
        }),
        prisma.accrualEntry.count({ where }),
        prisma.accrualEntry.groupBy({
          by: ['status'],
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Calculate summary
      const summary = {
        totalAmount: 0,
        pendingAmount: 0,
        postedAmount: 0,
        reversedAmount: 0,
        entryCount: total,
      };

      summaryData.forEach((item) => {
        const amount = Number(item._sum.amount) || 0;
        summary.totalAmount += amount;
        if (item.status === 'PENDING' || item.status === 'CALCULATED') {
          summary.pendingAmount += amount;
        } else if (item.status === 'POSTED') {
          summary.postedAmount += amount;
        } else if (item.status === 'REVERSED') {
          summary.reversedAmount += amount;
        }
      });

      return res.status(200).json({
        data: accruals,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        summary,
      });
    }

    if (req.method === 'POST') {
      const { promotionId, period, amount, notes } = req.body;

      if (!promotionId || !period || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields: promotionId, period, amount' });
      }

      const accrual = await prisma.accrualEntry.create({
        data: {
          promotionId,
          period,
          amount: parseFloat(amount),
          notes: notes || null,
          createdById: user.userId,
        },
      });

      return res.status(201).json({ data: accrual });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Accruals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
