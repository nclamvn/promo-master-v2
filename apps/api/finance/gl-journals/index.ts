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
      const { page = '1', limit = '20', status, sourceType, startDate, endDate } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (sourceType) where.sourceType = sourceType;
      if (startDate || endDate) {
        where.entryDate = {};
        if (startDate) (where.entryDate as Record<string, Date>).gte = new Date(startDate);
        if (endDate) (where.entryDate as Record<string, Date>).lte = new Date(endDate);
      }

      const [journals, total] = await Promise.all([
        prisma.gLJournal.findMany({
          where,
          skip,
          take,
          orderBy: { entryDate: 'desc' },
        }),
        prisma.gLJournal.count({ where }),
      ]);

      return res.status(200).json({
        data: journals,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { entryNumber, entryDate, description, debitAccount, creditAccount, amount, reference, sourceType, sourceId } = req.body;

      if (!entryNumber || !entryDate || !description || !debitAccount || !creditAccount || amount === undefined || !sourceType || !sourceId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const journal = await prisma.gLJournal.create({
        data: {
          entryNumber,
          entryDate: new Date(entryDate),
          description,
          debitAccount,
          creditAccount,
          amount: parseFloat(amount),
          reference: reference || null,
          sourceType,
          sourceId,
        },
      });

      return res.status(201).json({ data: journal });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('GL Journals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
