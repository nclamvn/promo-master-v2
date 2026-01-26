/**
 * GL Journal Reverse API
 * POST /api/finance/journals/[id]/reverse - Reverse a posted journal
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Journal ID is required' });
  }

  try {
    const journal = await prisma.gLJournal.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { lineNumber: 'asc' } },
      },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    if (journal.status !== 'POSTED') {
      return res.status(400).json({
        error: `Only posted journals can be reversed. Current status: ${journal.status}`,
      });
    }

    if (journal.reversedById) {
      return res.status(400).json({
        error: 'This journal has already been reversed',
      });
    }

    const { reason, reversalDate } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reversal reason is required' });
    }

    // Create reversal journal and update original in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate reversal journal code
      const count = await tx.gLJournal.count();
      const reversalCode = `JNL-${String(count + 1).padStart(6, '0')}-REV`;

      // Create reversal journal with swapped debits/credits
      const reversalJournal = await tx.gLJournal.create({
        data: {
          code: reversalCode,
          journalType: journal.journalType,
          journalDate: reversalDate ? new Date(reversalDate) : new Date(),
          description: `Reversal of ${journal.code}: ${reason}`,
          reference: journal.reference,
          status: 'POSTED',
          totalDebit: journal.totalCredit,
          totalCredit: journal.totalDebit,
          customerId: journal.customerId,
          promotionId: journal.promotionId,
          accrualId: journal.accrualId,
          claimId: journal.claimId,
          reversalOfId: journal.id,
          postedAt: new Date(),
          postedBy: req.body.userId || 'system',
          lines: {
            create: journal.lines.map((line, index) => ({
              lineNumber: index + 1,
              accountCode: line.accountCode,
              accountName: line.accountName,
              debit: line.credit, // Swap debit and credit
              credit: line.debit,
              description: `Reversal: ${line.description || ''}`,
              costCenter: line.costCenter,
              department: line.department,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      // Update original journal
      await tx.gLJournal.update({
        where: { id },
        data: {
          status: 'REVERSED',
          reversedById: reversalJournal.id,
          reversedAt: new Date(),
        },
      });

      return reversalJournal;
    });

    return res.status(200).json({
      success: true,
      message: 'Journal reversed successfully',
      reversalJournal: result,
    });
  } catch (error: any) {
    console.error('Reverse journal error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
