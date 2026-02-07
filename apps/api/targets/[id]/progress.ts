import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * GET /targets/:id/progress
 * Get progress summary by geographic level
 *
 * Returns:
 * - Overall progress
 * - Progress by region
 * - Progress by province
 * - Status breakdown (Achieved, Good, Slow, At Risk)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing target id' });

  try {
    // Get target with all allocations
    const target = await prisma.target.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            geographicUnit: true,
          },
        },
      },
    });

    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    const totalTarget = Number(target.totalTarget);
    const totalAchieved = Number(target.totalAchieved);
    const overallProgress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

    // Get status label based on progress percentage
    const getStatus = (progress: number): 'ACHIEVED' | 'GOOD' | 'SLOW' | 'AT_RISK' => {
      if (progress >= 100) return 'ACHIEVED';
      if (progress >= 75) return 'GOOD';
      if (progress >= 50) return 'SLOW';
      return 'AT_RISK';
    };

    // Group allocations by geographic level
    const byLevel: Record<string, Array<{
      id: string;
      code: string;
      name: string;
      targetValue: number;
      achievedValue: number;
      progress: number;
      status: string;
    }>> = {
      COUNTRY: [],
      REGION: [],
      PROVINCE: [],
      DISTRICT: [],
      DEALER: [],
    };

    for (const allocation of target.allocations) {
      const level = allocation.geographicUnit?.level || 'REGION';
      const targetVal = Number(allocation.targetValue);
      const achievedVal = Number(allocation.achievedValue);
      const progress = targetVal > 0 ? (achievedVal / targetVal) * 100 : 0;

      byLevel[level]?.push({
        id: allocation.id,
        code: allocation.code,
        name: allocation.geographicUnit?.name || allocation.code,
        targetValue: targetVal,
        achievedValue: achievedVal,
        progress: Math.round(progress * 10) / 10,
        status: getStatus(progress),
      });
    }

    // Calculate status breakdown
    const allAllocations = target.allocations.map(a => {
      const targetVal = Number(a.targetValue);
      const achievedVal = Number(a.achievedValue);
      const progress = targetVal > 0 ? (achievedVal / targetVal) * 100 : 0;
      return getStatus(progress);
    });

    const statusBreakdown = {
      achieved: allAllocations.filter(s => s === 'ACHIEVED').length,
      good: allAllocations.filter(s => s === 'GOOD').length,
      slow: allAllocations.filter(s => s === 'SLOW').length,
      atRisk: allAllocations.filter(s => s === 'AT_RISK').length,
    };

    // Calculate top performers and underperformers
    const sortedByProgress = target.allocations
      .map(a => {
        const targetVal = Number(a.targetValue);
        const achievedVal = Number(a.achievedValue);
        return {
          id: a.id,
          code: a.code,
          name: a.geographicUnit?.name || a.code,
          level: a.geographicUnit?.level || 'REGION',
          progress: targetVal > 0 ? (achievedVal / targetVal) * 100 : 0,
        };
      })
      .sort((a, b) => b.progress - a.progress);

    return res.status(200).json({
      data: {
        target: {
          id: target.id,
          code: target.code,
          name: target.name,
          metric: target.metric,
          year: target.year,
          quarter: target.quarter,
        },
        overall: {
          totalTarget,
          totalAchieved,
          progress: Math.round(overallProgress * 10) / 10,
          status: getStatus(overallProgress),
          remaining: Math.max(0, totalTarget - totalAchieved),
        },
        byLevel: {
          regions: byLevel.REGION,
          provinces: byLevel.PROVINCE,
          districts: byLevel.DISTRICT,
        },
        statusBreakdown,
        topPerformers: sortedByProgress.slice(0, 5),
        underperformers: sortedByProgress.slice(-5).reverse(),
      },
    });
  } catch (error) {
    console.error('Target progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
