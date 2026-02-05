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
      const claim = await prisma.claim.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, channel: true } },
          promotion: { select: { id: true, code: true, name: true, status: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
          settlement: true,
          transactions: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!claim) return res.status(404).json({ error: 'Claim not found' });
      return res.status(200).json({ data: claim });
    }

    if (req.method === 'PUT') {
      const { status, amount, description, reviewedById } = req.body;

      const claim = await prisma.claim.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(description !== undefined && { description }),
          ...(reviewedById && { reviewedById }),
        },
      });

      return res.status(200).json({ data: claim });
    }

    if (req.method === 'DELETE') {
      await prisma.claim.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Claim detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
