import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', year, quarter, month, status, metric, search } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};

      if (year) where.year = parseInt(year);
      if (quarter) where.quarter = parseInt(quarter);
      if (month) where.month = parseInt(month);
      if (status) where.status = status;
      if (metric) where.metric = metric;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [targets, total] = await Promise.all([
        prisma.target.findMany({
          where,
          skip,
          take,
          orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { month: 'desc' }],
          include: {
            _count: { select: { allocations: true } },
          },
        }),
        prisma.target.count({ where }),
      ]);

      // Calculate progress for each target
      const targetsWithProgress = targets.map(target => ({
        ...target,
        progressPercent: parseFloat(target.totalTarget.toString()) > 0
          ? (parseFloat(target.totalAchieved.toString()) / parseFloat(target.totalTarget.toString())) * 100
          : 0,
      }));

      return res.status(200).json({
        data: targetsWithProgress,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, description, year, quarter, month, totalTarget, metric } = req.body;

      if (!code || !name || !year || totalTarget === undefined) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: code, name, year, totalTarget' });
      }

      // Check for duplicate code
      const existing = await prisma.target.findUnique({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Mã mục tiêu đã tồn tại' });
      }

      // Validate metric
      const validMetrics = ['CASES', 'VOLUME_LITERS', 'REVENUE_VND', 'UNITS'];
      if (metric && !validMetrics.includes(metric)) {
        return res.status(400).json({ error: 'Đơn vị đo không hợp lệ' });
      }

      const target = await prisma.target.create({
        data: {
          code,
          name,
          description: description || null,
          year: parseInt(year),
          quarter: quarter ? parseInt(quarter) : null,
          month: month ? parseInt(month) : null,
          totalTarget: parseFloat(totalTarget),
          metric: metric || 'CASES',
          createdBy: user.userId,
        },
      });

      return res.status(201).json({ data: target });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Targets error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
