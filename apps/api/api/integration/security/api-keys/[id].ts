/**
 * API Key Detail API
 * GET /api/integration/security/api-keys/:id - Get key details
 * DELETE /api/integration/security/api-keys/:id - Revoke key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'API Key ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(id, res);
      case 'DELETE':
        return handleDelete(id, req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Key Detail API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const apiKey = await prisma.aPIKey.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!apiKey) {
    return res.status(404).json({
      success: false,
      error: 'API key not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...apiKey,
      key: undefined, // Never expose the key
    },
  });
}

async function handleDelete(id: string, req: VercelRequest, res: VercelResponse) {
  const apiKey = await prisma.aPIKey.findUnique({
    where: { id },
  });

  if (!apiKey) {
    return res.status(404).json({
      success: false,
      error: 'API key not found',
    });
  }

  if (!apiKey.isActive) {
    return res.status(400).json({
      success: false,
      error: 'API key is already revoked',
    });
  }

  // Revoke key (soft delete)
  await prisma.aPIKey.update({
    where: { id },
    data: { isActive: false },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: req.body?.userId || null,
      action: 'revoke',
      entityType: 'APIKey',
      entityId: id,
      oldValue: { name: apiKey.name, isActive: true },
      newValue: { isActive: false },
    },
  });

  return res.status(200).json({
    success: true,
    message: 'API key revoked successfully',
  });
}
