import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_lib/auth';

// ERP Integration placeholder - to be implemented based on specific ERP system
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      // Get ERP connection status
      return res.status(200).json({
        data: {
          status: 'not_configured',
          message: 'ERP integration not configured. Please contact administrator.',
          supportedSystems: ['SAP', 'Oracle', 'Microsoft Dynamics', 'NetSuite'],
        },
      });
    }

    if (req.method === 'POST') {
      const { action, system, config } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Missing required field: action' });
      }

      switch (action) {
        case 'connect':
          // Placeholder for ERP connection
          return res.status(200).json({
            data: {
              status: 'pending',
              message: `ERP connection to ${system || 'unknown'} initiated. Configuration required.`,
            },
          });

        case 'sync':
          // Placeholder for data sync
          return res.status(200).json({
            data: {
              status: 'pending',
              message: 'Data sync not available. Please configure ERP connection first.',
            },
          });

        case 'mapping':
          // Placeholder for field mapping
          return res.status(200).json({
            data: {
              status: 'not_configured',
              availableMappings: ['customers', 'products', 'orders', 'invoices'],
              configuredMappings: [],
            },
          });

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('ERP integration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
