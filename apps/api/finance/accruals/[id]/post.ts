import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// Generate unique entry number for GL journal
function generateEntryNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JE-${timestamp}-${random}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing accrual ID' });
  }

  try {
    const { glAccountDebit, glAccountCredit } = req.body;

    if (!glAccountDebit || !glAccountCredit) {
      return res.status(400).json({ error: 'Missing required fields: glAccountDebit, glAccountCredit' });
    }

    // Get the accrual
    const accrual = await prisma.accrualEntry.findUnique({
      where: { id },
      include: {
        promotion: { select: { code: true, name: true } },
      },
    });

    if (!accrual) {
      return res.status(404).json({ error: 'Accrual not found' });
    }

    if (accrual.status !== 'PENDING' && accrual.status !== 'CALCULATED') {
      return res.status(400).json({ error: 'Accrual is already posted or reversed' });
    }

    // Create GL Journal entry and update accrual in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create GL Journal entry
      const journal = await tx.gLJournal.create({
        data: {
          entryNumber: generateEntryNumber(),
          entryDate: new Date(),
          description: `Accrual for ${accrual.promotion.code} - ${accrual.promotion.name} (${accrual.period})`,
          debitAccount: glAccountDebit,
          creditAccount: glAccountCredit,
          amount: accrual.amount,
          sourceType: 'ACCRUAL',
          sourceId: accrual.id,
          status: 'POSTED',
          postedAt: new Date(),
          postedById: user.userId,
        },
      });

      // Update accrual status
      const updatedAccrual = await tx.accrualEntry.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedToGL: true,
          glJournalId: journal.id,
        },
        include: {
          promotion: { select: { id: true, code: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return { accrual: updatedAccrual, journal };
    });

    return res.status(200).json({
      success: true,
      data: {
        accrual: {
          ...result.accrual,
          amount: Number(result.accrual.amount),
        },
        journal: {
          ...result.journal,
          amount: Number(result.journal.amount),
        },
      },
      message: 'Accrual posted to GL successfully',
    });
  } catch (error) {
    console.error('Post accrual error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
