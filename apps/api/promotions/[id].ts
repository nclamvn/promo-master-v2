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
      const promotion = await prisma.promotion.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, channel: true, code: true } },
          fund: { select: { id: true, name: true, code: true, type: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          tactics: {
            include: {
              items: { include: { product: { select: { id: true, name: true, sku: true } } } },
            },
          },
          claims: {
            select: { id: true, code: true, amount: true, status: true, claimDate: true },
            orderBy: { claimDate: 'desc' },
          },
        },
      });

      if (!promotion) return res.status(404).json({ error: 'Promotion not found' });
      return res.status(200).json({ data: promotion });
    }

    if (req.method === 'PUT') {
      const { name, description, status, startDate, endDate, budget } = req.body;

      const promotion = await prisma.promotion.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(budget !== undefined && { budget: parseFloat(budget) }),
        },
      });

      return res.status(200).json({ data: promotion });
    }

    if (req.method === 'DELETE') {
      await prisma.promotion.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Promotion detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
