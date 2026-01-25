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
      const { page = '1', limit = '20', type, isActive, category } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (category) where.category = category;

      const [templates, total] = await Promise.all([
        prisma.promotionTemplate.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
            _count: { select: { versions: true } },
          },
        }),
        prisma.promotionTemplate.count({ where }),
      ]);

      return res.status(200).json({
        data: templates,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, description, type, category, defaultDuration, defaultBudget, mechanics, eligibility } = req.body;

      if (!code || !name || !type) {
        return res.status(400).json({ error: 'Missing required fields: code, name, type' });
      }

      const template = await prisma.promotionTemplate.create({
        data: {
          code,
          name,
          description: description || null,
          type,
          category: category || null,
          defaultDuration: defaultDuration ? parseInt(defaultDuration) : null,
          defaultBudget: defaultBudget ? parseFloat(defaultBudget) : null,
          mechanics: mechanics || null,
          eligibility: eligibility || null,
          createdById: user.userId,
        },
      });

      return res.status(201).json({ data: template });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Templates error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
