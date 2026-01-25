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
      const { page = '1', limit = '20', status, customerId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;

      const [deductions, total] = await Promise.all([
        prisma.deduction.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true } },
            matchedClaim: { select: { id: true, code: true } },
          },
        }),
        prisma.deduction.count({ where }),
      ]);

      return res.status(200).json({
        data: deductions,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, customerId, invoiceNumber, invoiceDate, amount, reason } = req.body;

      if (!code || !customerId || !invoiceNumber || !invoiceDate || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields: code, customerId, invoiceNumber, invoiceDate, amount' });
      }

      const deduction = await prisma.deduction.create({
        data: {
          code,
          customerId,
          invoiceNumber,
          invoiceDate: new Date(invoiceDate),
          amount: parseFloat(amount),
          reason: reason || null,
        },
      });

      return res.status(201).json({ data: deduction });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Deductions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
