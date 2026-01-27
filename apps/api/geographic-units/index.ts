import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
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
      const { level, parentId, tree, search } = req.query as Record<string, string>;

      // If tree=true, return hierarchical structure
      if (tree === 'true') {
        const rootUnits = await prisma.geographicUnit.findMany({
          where: { parentId: null, isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
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
                      include: {
                        children: {
                          where: { isActive: true },
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return res.status(200).json({ data: rootUnits });
      }

      // Regular list query
      const where: Record<string, unknown> = { isActive: true };

      if (level) where.level = level;
      if (parentId) where.parentId = parentId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
        ];
      }

      const units = await prisma.geographicUnit.findMany({
        where,
        orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
          _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } },
        },
      });

      return res.status(200).json({ data: units });
    }

    if (req.method === 'POST') {
      const { code, name, nameEn, level, parentId, latitude, longitude, sortOrder } = req.body;

      if (!code || !name || !level) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: code, name, level' });
      }

      // Validate level
      const validLevels = ['COUNTRY', 'REGION', 'PROVINCE', 'DISTRICT', 'DEALER'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({ error: 'Cấp địa lý không hợp lệ' });
      }

      // Check for duplicate code
      const existing = await prisma.geographicUnit.findUnique({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Mã đơn vị địa lý đã tồn tại' });
      }

      // Validate parent if provided
      if (parentId) {
        const parent = await prisma.geographicUnit.findUnique({ where: { id: parentId } });
        if (!parent) {
          return res.status(400).json({ error: 'Đơn vị địa lý cha không tồn tại' });
        }
      }

      const unit = await prisma.geographicUnit.create({
        data: {
          code,
          name,
          nameEn: nameEn || null,
          level,
          parentId: parentId || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
        },
      });

      return res.status(201).json({ data: unit });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Geographic Units error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
