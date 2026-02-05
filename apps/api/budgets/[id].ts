import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
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
      const fund = await prisma.fund.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, channel: true } },
          promotions: {
            select: { id: true, code: true, name: true, status: true, budget: true, startDate: true, endDate: true },
            orderBy: { startDate: 'desc' },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      if (!fund) return res.status(404).json({ error: 'Budget not found' });
      return res.status(200).json({ data: fund });
    }

    if (req.method === 'PUT') {
      const { name, type, totalBudget, isActive } = req.body;

      const fund = await prisma.fund.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(totalBudget !== undefined && { totalBudget: parseFloat(totalBudget), available: parseFloat(totalBudget) }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return res.status(200).json({ data: fund });
    }

    if (req.method === 'DELETE') {
      await prisma.fund.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budget detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
