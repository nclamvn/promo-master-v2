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
      const { page = '1', limit = '20', severity, promotionId, resolved } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (severity) where.severity = severity;
      if (promotionId) {
        where.OR = [{ promotionId }, { clashWithId: promotionId }];
      }
      if (resolved !== undefined) {
        where.resolvedAt = resolved === 'true' ? { not: null } : null;
      }

      const [clashes, total] = await Promise.all([
        prisma.clashDetection.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            promotion: { select: { id: true, code: true, name: true } },
            clashWith: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.clashDetection.count({ where }),
      ]);

      return res.status(200).json({
        data: clashes,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      // Check for clashes between a promotion and others
      const { promotionId } = req.body;

      if (!promotionId) {
        return res.status(400).json({ error: 'Missing required field: promotionId' });
      }

      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: {
          customers: { select: { customerId: true } },
          products: { select: { productId: true } },
        },
      });

      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      // Find overlapping promotions
      const overlapping = await prisma.promotion.findMany({
        where: {
          id: { not: promotionId },
          startDate: { lte: promotion.endDate },
          endDate: { gte: promotion.startDate },
        },
        include: {
          customers: { select: { customerId: true } },
          products: { select: { productId: true } },
        },
      });

      const clashes = [];
      for (const other of overlapping) {
        const customerOverlap = promotion.customers.some(c =>
          other.customers.some(oc => oc.customerId === c.customerId)
        );
        const productOverlap = promotion.products.some(p =>
          other.products.some(op => op.productId === p.productId)
        );

        if (customerOverlap || productOverlap) {
          clashes.push({
            promotionId,
            clashWithId: other.id,
            clashType: customerOverlap && productOverlap ? 'PRODUCT_OVERLAP' : customerOverlap ? 'CUSTOMER_OVERLAP' : 'DATE_OVERLAP',
            severity: customerOverlap && productOverlap ? 'HIGH' : 'MEDIUM',
            description: `Overlaps with ${other.code} on ${customerOverlap ? 'customers' : ''} ${productOverlap ? 'products' : ''}`.trim(),
          });
        }
      }

      // Upsert clashes
      const results = await Promise.all(
        clashes.map(clash =>
          prisma.clashDetection.upsert({
            where: {
              promotionId_clashWithId_clashType: {
                promotionId: clash.promotionId,
                clashWithId: clash.clashWithId,
                clashType: clash.clashType as 'DATE_OVERLAP' | 'CUSTOMER_OVERLAP' | 'PRODUCT_OVERLAP' | 'BUDGET_CONFLICT' | 'MECHANIC_CONFLICT',
              },
            },
            update: { severity: clash.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', description: clash.description },
            create: clash as Parameters<typeof prisma.clashDetection.create>[0]['data'],
          })
        )
      );

      return res.status(200).json({ data: results, count: results.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clash detection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
