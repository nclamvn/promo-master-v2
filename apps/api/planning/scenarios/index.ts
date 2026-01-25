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
      const { page = '1', limit = '20', status, baselineId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (baselineId) where.baselineId = baselineId;

      const [scenarios, total] = await Promise.all([
        prisma.scenario.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            baseline: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
            _count: { select: { versions: true } },
          },
        }),
        prisma.scenario.count({ where }),
      ]);

      return res.status(200).json({
        data: scenarios,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { name, description, baselineId, parameters, assumptions } = req.body;

      if (!name || !parameters) {
        return res.status(400).json({ error: 'Missing required fields: name, parameters' });
      }

      const scenario = await prisma.scenario.create({
        data: {
          name,
          description: description || null,
          baselineId: baselineId || null,
          parameters,
          assumptions: assumptions || null,
          createdById: user.userId,
        },
      });

      return res.status(201).json({ data: scenario });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Scenarios error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
