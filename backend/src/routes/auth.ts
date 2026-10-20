import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';

export const authRoutes = new Hono();

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
  try {
    const { phone, password, fullName } = await c.req.json();

    if (!phone || !password) {
      return c.json({ error: 'Telefon numarası ve şifre zorunludur.' }, 400);
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return c.json({ error: 'Bu telefon numarası ile kayıtlı kullanıcı zaten var.' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      phone: cleanPhone,
      passwordHash,
      fullName: fullName || '',
    });

    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone,
    });

    return c.json(
      {
        message: 'Kayıt başarılı',
        token,
        user: {
          id: user._id,
          phone: user.phone,
          fullName: user.fullName,
        },
      },
      201
    );
  } catch (err: any) {
    return c.json({ error: err.message || 'Kayıt sırasında bir hata oluştu.' }, 500);
  }
});

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  try {
    const { phone, password } = await c.req.json();

    if (!phone || !password) {
      return c.json({ error: 'Telefon numarası ve şifre gereklidir.' }, 400);
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return c.json({ error: 'Telefon numarası veya şifre hatalı.' }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return c.json({ error: 'Telefon numarası veya şifre hatalı.' }, 401);
    }

    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone,
    });

    return c.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Giriş sırasında hata oluştu.' }, 500);
  }
});

// GET /api/auth/me (Profil bilgisi getirme)
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Yetkisiz erişim.' }, 401);
  }
  const token = authHeader.split(' ')[1];
  if (!token) return c.json({ error: 'Token bulunamadı.' }, 401);

  try {
    const jwtSecret = process.env.JWT_SECRET || 'ozyurt-zahire-super-secret-key-2026';
    const jwt = await import('jsonwebtoken');
    const decoded: any = (jwt.default || jwt).verify(token, jwtSecret as string);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return c.json({ error: 'Kullanıcı bulunamadı.' }, 404);
    return c.json({
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
      },
    });
  } catch (err: any) {
    return c.json({ error: 'Geçersiz token.' }, 401);
  }
});

// PUT /api/auth/profile (Ad Soyad güncelleme)
authRoutes.put('/profile', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Yetkisiz erişim.' }, 401);
  }
  const token = authHeader.split(' ')[1];
  if (!token) return c.json({ error: 'Token bulunamadı.' }, 401);

  try {
    const jwtSecret = process.env.JWT_SECRET || 'ozyurt-zahire-super-secret-key-2026';
    const jwt = await import('jsonwebtoken');
    const decoded: any = (jwt.default || jwt).verify(token, jwtSecret as string);
    const { fullName } = await c.req.json();

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return c.json({ error: 'Ad Soyad alanı boş bırakılamaz.' }, 400);
    }

    const updated = await User.findByIdAndUpdate(
      decoded.userId,
      { fullName: fullName.trim() },
      { new: true }
    ).select('-passwordHash');

    if (!updated) return c.json({ error: 'Kullanıcı bulunamadı.' }, 404);

    return c.json({
      message: 'Profil güncellendi',
      user: {
        id: updated._id,
        phone: updated.phone,
        fullName: updated.fullName,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Profil güncellenirken hata oluştu.' }, 500);
  }
});
