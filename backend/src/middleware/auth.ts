import type { MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ozyurt-zahire-super-secret-key-2026';

export interface AuthUserPayload {
  userId: string;
  phone: string;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Yetkisiz erişim. Token bulunamadı.' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ error: 'Yetkisiz erişim. Token bulunamadı.' }, 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthUserPayload;
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Geçersiz veya süresi dolmuş token.' }, 401);
  }
};

export function generateToken(payload: AuthUserPayload): string {
  // 30 günlük JWT süresi
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}
