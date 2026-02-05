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

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', status, customerId, search } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {
        fund: { company: { users: { some: { id: user.userId } } } },
      };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [promotions, total] = await Promise.all([
        prisma.promotion.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, channel: true } },
            fund: { select: { id: true, name: true, code: true } },
            _count: { select: { tactics: true, claims: true } },
          },
        }),
        prisma.promotion.count({ where }),
      ]);

      return res.status(200).json({
        data: promotions,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, description, customerId, fundId, startDate, endDate, budget } = req.body;

      if (!code || !name || !customerId || !fundId || !startDate || !endDate || !budget) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const promotion = await prisma.promotion.create({
        data: {
          code,
          name,
          description: description || null,
          customerId,
          fundId,
          createdById: user.userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          budget: parseFloat(budget),
        },
      });

      return res.status(201).json({ data: promotion });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Promotions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
