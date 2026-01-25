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
      const { page = '1', limit = '20', customerId, productId, snapshotDate } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (customerId) where.customerId = customerId;
      if (productId) where.productId = productId;
      if (snapshotDate) where.snapshotDate = new Date(snapshotDate);

      const [snapshots, total] = await Promise.all([
        prisma.inventorySnapshot.findMany({
          where,
          skip,
          take,
          orderBy: { snapshotDate: 'desc' },
          include: {
            customer: { select: { id: true, name: true } },
            product: { select: { id: true, name: true, sku: true } },
          },
        }),
        prisma.inventorySnapshot.count({ where }),
      ]);

      return res.status(200).json({
        data: snapshots,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { customerId, productId, snapshotDate, quantity, value, location, batchNumber, expiryDate } = req.body;

      if (!customerId || !productId || !snapshotDate || quantity === undefined || value === undefined) {
        return res.status(400).json({ error: 'Missing required fields: customerId, productId, snapshotDate, quantity, value' });
      }

      const snapshot = await prisma.inventorySnapshot.create({
        data: {
          customerId,
          productId,
          snapshotDate: new Date(snapshotDate),
          quantity: parseInt(quantity),
          value: parseFloat(value),
          location: location || null,
          batchNumber: batchNumber || null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
      });

      return res.status(201).json({ data: snapshot });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Inventory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
