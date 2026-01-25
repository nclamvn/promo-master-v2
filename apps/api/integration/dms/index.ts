import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_lib/auth';

// DMS (Distribution Management System) Integration placeholder
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      // Get DMS connection status
      return res.status(200).json({
        data: {
          status: 'not_configured',
          message: 'DMS integration not configured. Please contact administrator.',
          supportedSystems: ['DMS-1', 'DMS-Pro', 'Custom API'],
        },
      });
    }

    if (req.method === 'POST') {
      const { action } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Missing required field: action' });
      }

      switch (action) {
        case 'connect':
          return res.status(200).json({
            data: {
              status: 'pending',
              message: 'DMS connection initiated. Configuration required.',
            },
          });

        case 'import-sellout':
          return res.status(200).json({
            data: {
              status: 'not_configured',
              message: 'Sell-out import not available. Please configure DMS connection first.',
            },
          });

        case 'import-inventory':
          return res.status(200).json({
            data: {
              status: 'not_configured',
              message: 'Inventory import not available. Please configure DMS connection first.',
            },
          });

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DMS integration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
