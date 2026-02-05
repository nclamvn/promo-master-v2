import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
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

      const [deductions, total, summaryData] = await Promise.all([
        prisma.deduction.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, code: true } },
            matchedClaim: { select: { id: true, code: true, amount: true } },
          },
        }),
        prisma.deduction.count({ where }),
        prisma.deduction.groupBy({
          by: ['status'],
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Calculate summary
      const summary = {
        totalOpen: 0,
        totalMatched: 0,
        totalDisputed: 0,
        totalResolved: 0,
        openAmount: 0,
        matchedAmount: 0,
        disputedAmount: 0,
      };

      summaryData.forEach((item) => {
        const amount = Number(item._sum.amount) || 0;
        const count = item._count || 0;

        switch (item.status) {
          case 'OPEN':
            summary.totalOpen = count;
            summary.openAmount = amount;
            break;
          case 'MATCHED':
            summary.totalMatched = count;
            summary.matchedAmount = amount;
            break;
          case 'DISPUTED':
            summary.totalDisputed = count;
            summary.disputedAmount = amount;
            break;
          case 'RESOLVED':
          case 'WRITTEN_OFF':
            summary.totalResolved += count;
            break;
        }
      });

      return res.status(200).json({
        data: deductions,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        summary,
      });
    }

    if (req.method === 'POST') {
      const { code, customerId, invoiceNumber, invoiceDate, amount, reason } = req.body;

      if (!customerId || !invoiceNumber || !invoiceDate || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields: customerId, invoiceNumber, invoiceDate, amount' });
      }

      // Check if customer exists
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Generate code if not provided
      const deductionCode = code || `DED-${Date.now().toString(36).toUpperCase()}`;

      // Check for duplicate invoice number for same customer
      const existing = await prisma.deduction.findFirst({
        where: { customerId, invoiceNumber },
      });
      if (existing) {
        return res.status(400).json({ error: 'Deduction with this invoice number already exists for this customer' });
      }

      const deduction = await prisma.deduction.create({
        data: {
          code: deductionCode,
          customerId,
          invoiceNumber,
          invoiceDate: new Date(invoiceDate),
          amount: parseFloat(amount),
          reason: reason || null,
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
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
