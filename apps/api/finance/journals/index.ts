/**
 * GL Journals API - List & Create
 * GET /api/finance/journals - List journals with filters
 * POST /api/finance/journals - Create journal entry
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      return handleList(req, res);
    } else if (req.method === 'POST') {
      return handleCreate(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Journals API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    status,
    type,
    customerId,
    promotionId,
    startDate,
    endDate,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.journalType = type;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (promotionId) {
    where.promotionId = promotionId;
  }

  if (startDate || endDate) {
    where.journalDate = {};
    if (startDate) {
      where.journalDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.journalDate.lte = new Date(endDate as string);
    }
  }

  // Get journals with pagination
  const [journals, total] = await Promise.all([
    prisma.gLJournal.findMany({
      where,
      include: {
        customer: {
          select: { id: true, code: true, name: true },
        },
        promotion: {
          select: { id: true, code: true, name: true },
        },
        accrual: {
          select: { id: true, code: true },
        },
        claim: {
          select: { id: true, code: true },
        },
        lines: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
            debit: true,
            credit: true,
            description: true,
          },
        },
      },
      orderBy: { journalDate: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.gLJournal.count({ where }),
  ]);

  // Get summary stats
  const summary = await prisma.gLJournal.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalDebit: true },
  });

  const summaryData = {
    totalDraft: 0,
    totalPosted: 0,
    totalReversed: 0,
    draftAmount: 0,
    postedAmount: 0,
  };

  summary.forEach((s) => {
    if (s.status === 'DRAFT') {
      summaryData.totalDraft = s._count.id;
      summaryData.draftAmount = s._sum.totalDebit?.toNumber() || 0;
    } else if (s.status === 'POSTED') {
      summaryData.totalPosted = s._count.id;
      summaryData.postedAmount = s._sum.totalDebit?.toNumber() || 0;
    } else if (s.status === 'REVERSED') {
      summaryData.totalReversed = s._count.id;
    }
  });

  return res.status(200).json({
    journals,
    summary: summaryData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const {
    journalType,
    journalDate,
    description,
    customerId,
    promotionId,
    accrualId,
    claimId,
    reference,
    lines,
  } = req.body;

  // Validate required fields
  if (!journalType || !journalDate || !lines || lines.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: journalType, journalDate, lines',
    });
  }

  // Validate lines balance (debits = credits)
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    totalDebit += parseFloat(line.debit || 0);
    totalCredit += parseFloat(line.credit || 0);
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: `Journal must balance. Debit: ${totalDebit}, Credit: ${totalCredit}`,
    });
  }

  // Generate journal code
  const count = await prisma.gLJournal.count();
  const code = `JNL-${String(count + 1).padStart(6, '0')}`;

  // Create journal with lines
  const journal = await prisma.gLJournal.create({
    data: {
      code,
      journalType,
      journalDate: new Date(journalDate),
      description,
      reference,
      status: 'DRAFT',
      totalDebit,
      totalCredit,
      customerId: customerId || null,
      promotionId: promotionId || null,
      accrualId: accrualId || null,
      claimId: claimId || null,
      lines: {
        create: lines.map((line: any, index: number) => ({
          lineNumber: index + 1,
          accountCode: line.accountCode,
          accountName: line.accountName,
          debit: parseFloat(line.debit || 0),
          credit: parseFloat(line.credit || 0),
          description: line.description,
          costCenter: line.costCenter,
          department: line.department,
        })),
      },
    },
    include: {
      lines: true,
      customer: {
        select: { id: true, code: true, name: true },
      },
      promotion: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  return res.status(201).json(journal);
}
