import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface JwtPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends VercelRequest {
  auth: JwtPayload;
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  return decoded;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function getUserFromRequest(req: VercelRequest): JwtPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    (req as AuthenticatedRequest).auth = user;
    await handler(req as AuthenticatedRequest, res);
  };
}
