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
      const { includeTree } = req.query as Record<string, string>;

      const unit = await prisma.geographicUnit.findUnique({
        where: { id },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
          children: includeTree === 'true' ? {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                include: {
                  children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          } : {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } },
        },
      });

      if (!unit) {
        return res.status(404).json({ error: 'Không tìm thấy đơn vị địa lý' });
      }

      return res.status(200).json({ data: unit });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, nameEn, parentId, latitude, longitude, sortOrder, isActive } = req.body;

      const existing = await prisma.geographicUnit.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy đơn vị địa lý' });
      }

      // Validate parent if changing
      if (parentId && parentId !== existing.parentId) {
        const parent = await prisma.geographicUnit.findUnique({ where: { id: parentId } });
        if (!parent) {
          return res.status(400).json({ error: 'Đơn vị địa lý cha không tồn tại' });
        }
        // Prevent circular reference
        if (parentId === id) {
          return res.status(400).json({ error: 'Không thể đặt chính nó làm cha' });
        }
      }

      const updated = await prisma.geographicUnit.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          nameEn: nameEn !== undefined ? nameEn : existing.nameEn,
          parentId: parentId !== undefined ? parentId : existing.parentId,
          latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existing.latitude,
          longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existing.longitude,
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
        },
      });

      return res.status(200).json({ data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.geographicUnit.findUnique({
        where: { id },
        include: { _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } } },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy đơn vị địa lý' });
      }

      // Check for dependencies
      if (existing._count.children > 0) {
        return res.status(400).json({ error: 'Không thể xóa vì có đơn vị con' });
      }
      if (existing._count.budgetAllocations > 0 || existing._count.targetAllocations > 0) {
        return res.status(400).json({ error: 'Không thể xóa vì có dữ liệu phân bổ liên quan' });
      }

      await prisma.geographicUnit.delete({ where: { id } });

      return res.status(200).json({ message: 'Đã xóa đơn vị địa lý' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Geographic Unit error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
