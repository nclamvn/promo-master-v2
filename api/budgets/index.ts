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

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', year, type, search } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {
        company: { users: { some: { id: user.userId } } },
      };

      if (year) where.year = parseInt(year);
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [funds, total] = await Promise.all([
        prisma.fund.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, channel: true } },
            _count: { select: { promotions: true } },
          },
        }),
        prisma.fund.count({ where }),
      ]);

      return res.status(200).json({
        data: funds,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, type, year, totalBudget, customerId } = req.body;

      if (!code || !name || !year || !totalBudget) {
        return res.status(400).json({ error: 'Missing required fields: code, name, year, totalBudget' });
      }

      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const fund = await prisma.fund.create({
        data: {
          code,
          name,
          type: type || 'FIXED',
          year: parseInt(year),
          totalBudget: parseFloat(totalBudget),
          available: parseFloat(totalBudget),
          companyId: userRecord.companyId,
          customerId: customerId || null,
        },
      });

      return res.status(201).json({ data: fund });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budgets error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
