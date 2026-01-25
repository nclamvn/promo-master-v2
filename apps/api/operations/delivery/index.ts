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
      const { page = '1', limit = '20', status, customerId, promotionId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (promotionId) where.promotionId = promotionId;

      const [orders, total] = await Promise.all([
        prisma.deliveryOrder.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: 'desc' },
          include: {
            customer: { select: { id: true, name: true } },
            promotion: { select: { id: true, code: true, name: true } },
            lines: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
              },
            },
          },
        }),
        prisma.deliveryOrder.count({ where }),
      ]);

      return res.status(200).json({
        data: orders,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { orderNumber, promotionId, customerId, scheduledDate, deliveryAddress, contactPerson, contactPhone, lines, notes } = req.body;

      if (!orderNumber || !customerId || !scheduledDate) {
        return res.status(400).json({ error: 'Missing required fields: orderNumber, customerId, scheduledDate' });
      }

      const order = await prisma.deliveryOrder.create({
        data: {
          orderNumber,
          promotionId: promotionId || null,
          customerId,
          scheduledDate: new Date(scheduledDate),
          deliveryAddress: deliveryAddress || null,
          contactPerson: contactPerson || null,
          contactPhone: contactPhone || null,
          notes: notes || null,
          createdById: user.userId,
          lines: lines ? {
            create: lines.map((line: { productId: string; quantity: number }) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          } : undefined,
        },
        include: {
          lines: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      });

      return res.status(201).json({ data: order });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Delivery error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
