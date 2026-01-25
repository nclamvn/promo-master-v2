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
      const { page = '1', limit = '20', customerId, productId, period } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (customerId) where.customerId = customerId;
      if (productId) where.productId = productId;
      if (period) where.period = period;

      const [tracking, total] = await Promise.all([
        prisma.sellTracking.findMany({
          where,
          skip,
          take,
          orderBy: { period: 'desc' },
          include: {
            customer: { select: { id: true, name: true } },
            product: { select: { id: true, name: true, sku: true } },
          },
        }),
        prisma.sellTracking.count({ where }),
      ]);

      return res.status(200).json({
        data: tracking,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { customerId, productId, period, sellInQty, sellInValue, sellOutQty, sellOutValue, stockQty, stockValue } = req.body;

      if (!customerId || !productId || !period) {
        return res.status(400).json({ error: 'Missing required fields: customerId, productId, period' });
      }

      const tracking = await prisma.sellTracking.upsert({
        where: {
          customerId_productId_period: { customerId, productId, period },
        },
        update: {
          sellInQty: sellInQty !== undefined ? parseInt(sellInQty) : undefined,
          sellInValue: sellInValue !== undefined ? parseFloat(sellInValue) : undefined,
          sellOutQty: sellOutQty !== undefined ? parseInt(sellOutQty) : undefined,
          sellOutValue: sellOutValue !== undefined ? parseFloat(sellOutValue) : undefined,
          stockQty: stockQty !== undefined ? parseInt(stockQty) : undefined,
          stockValue: stockValue !== undefined ? parseFloat(stockValue) : undefined,
        },
        create: {
          customerId,
          productId,
          period,
          sellInQty: sellInQty ? parseInt(sellInQty) : 0,
          sellInValue: sellInValue ? parseFloat(sellInValue) : 0,
          sellOutQty: sellOutQty ? parseInt(sellOutQty) : 0,
          sellOutValue: sellOutValue ? parseFloat(sellOutValue) : 0,
          stockQty: stockQty ? parseInt(stockQty) : 0,
          stockValue: stockValue ? parseFloat(stockValue) : 0,
        },
      });

      return res.status(200).json({ data: tracking });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sell tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
