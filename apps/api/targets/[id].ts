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

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  try {
    if (req.method === 'GET') {
      const target = await prisma.target.findUnique({
        where: { id },
        include: {
          allocations: {
            include: {
              geographicUnit: true,
            },
          },
          _count: { select: { allocations: true } },
        },
      });

      if (!target) {
        return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
      }

      // Calculate progress
      const progressPercent = parseFloat(target.totalTarget.toString()) > 0
        ? (parseFloat(target.totalAchieved.toString()) / parseFloat(target.totalTarget.toString())) * 100
        : 0;

      return res.status(200).json({
        data: {
          ...target,
          progressPercent,
        },
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, description, totalTarget, status, metric, isActive } = req.body;

      const existing = await prisma.target.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
      }

      const updateData: Record<string, unknown> = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (totalTarget !== undefined) updateData.totalTarget = parseFloat(totalTarget);
      if (status !== undefined) updateData.status = status;
      if (isActive !== undefined) updateData.isActive = isActive;

      if (metric !== undefined) {
        const validMetrics = ['CASES', 'VOLUME_LITERS', 'REVENUE_VND', 'UNITS'];
        if (!validMetrics.includes(metric)) {
          return res.status(400).json({ error: 'Đơn vị đo không hợp lệ' });
        }
        updateData.metric = metric;
      }

      const updated = await prisma.target.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({ data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.target.findUnique({
        where: { id },
        include: { _count: { select: { allocations: true } } },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
      }

      // Check status - only DRAFT can be deleted
      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Chỉ có thể xóa mục tiêu ở trạng thái DRAFT' });
      }

      // Delete all allocations first (cascade)
      await prisma.targetAllocation.deleteMany({ where: { targetId: id } });

      await prisma.target.delete({ where: { id } });

      return res.status(200).json({ message: 'Đã xóa mục tiêu' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Target error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
