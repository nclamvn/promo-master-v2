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
      const { page = '1', limit = '20', status, customerId, promotionId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const where: Record<string, unknown> = {
        customer: { companyId: userRecord.companyId },
      };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (promotionId) where.promotionId = promotionId;

      const [claims, total] = await Promise.all([
        prisma.claim.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true } },
            promotion: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.claim.count({ where }),
      ]);

      return res.status(200).json({
        data: claims,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, amount, customerId, promotionId, claimDate, description } = req.body;

      if (!code || !amount || !customerId || !claimDate) {
        return res.status(400).json({ error: 'Missing required fields: code, amount, customerId, claimDate' });
      }

      const claim = await prisma.claim.create({
        data: {
          code,
          amount: parseFloat(amount),
          customerId,
          promotionId: promotionId || null,
          claimDate: new Date(claimDate),
          description: description || null,
        },
      });

      return res.status(201).json({ data: claim });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Claims error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
