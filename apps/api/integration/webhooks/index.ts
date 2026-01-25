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
      const { page = '1', limit = '20', isActive } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [webhooks, total] = await Promise.all([
        prisma.webhook.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { logs: true } },
          },
        }),
        prisma.webhook.count({ where }),
      ]);

      return res.status(200).json({
        data: webhooks,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { name, url, secret, events, headers, retryCount } = req.body;

      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Missing required fields: name, url, events (array)' });
      }

      const webhook = await prisma.webhook.create({
        data: {
          name,
          url,
          secret: secret || null,
          events,
          headers: headers || null,
          retryCount: retryCount ? parseInt(retryCount) : 3,
          createdById: user.userId,
        },
      });

      return res.status(201).json({ data: webhook });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Webhooks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
