/**
 * Promotion Templates API - List & Create
 * GET /api/planning/templates - List templates with filters & summary
 * POST /api/planning/templates - Create new template with initial version
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
    console.error('Templates API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    type,
    category,
    isActive,
    search,
    page = '1',
    pageSize = '20',
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page);
  const limit = parseInt(pageSize);
  const skip = (pageNum - 1) * limit;

  // Build where clause
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get templates with pagination
  const [templates, total] = await Promise.all([
    prisma.promotionTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { versions: true, promotions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.promotionTemplate.count({ where }),
  ]);

  // Get summary stats
  const summaryStats = await prisma.promotionTemplate.groupBy({
    by: ['type', 'isActive'],
    _count: { id: true },
  });

  const byType: Record<string, number> = {};
  let active = 0;
  let inactive = 0;

  summaryStats.forEach((s) => {
    if (!byType[s.type]) byType[s.type] = 0;
    byType[s.type] += s._count.id;

    if (s.isActive) {
      active += s._count.id;
    } else {
      inactive += s._count.id;
    }
  });

  return res.status(200).json({
    success: true,
    data: templates,
    pagination: {
      page: pageNum,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      total,
      active,
      inactive,
      byType,
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const {
    code,
    name,
    description,
    type,
    category,
    defaultDuration,
    defaultBudget,
    mechanics,
    eligibility,
  } = req.body;

  // Validate required fields
  if (!code || !name || !type) {
    return res.status(400).json({
      error: 'Missing required fields: code, name, type',
    });
  }

  // Check for duplicate code
  const existing = await prisma.promotionTemplate.findUnique({
    where: { code },
  });

  if (existing) {
    return res.status(400).json({
      error: `Template code '${code}' already exists`,
    });
  }

  // Create template with initial version in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create template
    const template = await tx.promotionTemplate.create({
      data: {
        code,
        name,
        description: description || null,
        type,
        category: category || null,
        defaultDuration: defaultDuration ? parseInt(defaultDuration) : null,
        defaultBudget: defaultBudget ? parseFloat(defaultBudget) : null,
        mechanics: mechanics || {},
        eligibility: eligibility || {},
        isActive: true,
        usageCount: 0,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create initial version (version 1)
    await tx.templateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        snapshot: {
          code,
          name,
          description,
          type,
          category,
          defaultDuration,
          defaultBudget,
          mechanics,
          eligibility,
        },
        changes: null,
      },
    });

    return template;
  });

  return res.status(201).json({
    success: true,
    data: result,
  });
}
