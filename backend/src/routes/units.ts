import { Hono } from 'hono';
import { Unit } from '../models/Unit';
import { Product, ProductStatus } from '../models/Product';
import { authMiddleware } from '../middleware/auth';

export const unitRoutes = new Hono();

// Tüm birim rotalarını korumaya alalım
unitRoutes.use('*', authMiddleware);

// GET /api/units - Tüm birimleri listele
unitRoutes.get('/', async (c) => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    return c.json(units);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/units - Yeni birim ekle (sadece name yeterli)
unitRoutes.post('/', async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: 'Birim adı zorunludur.' }, 400);
    }

    const trimmedName = name.trim();
    const existing = await Unit.findOne({ name: trimmedName });
    if (existing) {
      return c.json({ error: 'Bu birim adı zaten mevcut.' }, 400);
    }

    const unit = await Unit.create({ name: trimmedName });
    return c.json(unit, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/units/:id - Birim detayı
unitRoutes.get('/:id', async (c) => {
  try {
    const unit = await Unit.findById(c.req.param('id'));
    if (!unit) return c.json({ error: 'Birim bulunamadı.' }, 404);
    return c.json(unit);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/units/:id - Birim güncelle
unitRoutes.put('/:id', async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: 'Birim adı zorunludur.' }, 400);
    }

    const unit = await Unit.findByIdAndUpdate(
      c.req.param('id'),
      { name: name.trim() },
      { new: true }
    );
    if (!unit) return c.json({ error: 'Birim bulunamadı.' }, 404);
    return c.json(unit);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/units/:id - Birim sil
unitRoutes.delete('/:id', async (c) => {
  try {
    const unitId = c.req.param('id');
    const productsCount = await Product.countDocuments({ unitId });
    if (productsCount > 0) {
      return c.json({ error: 'Bu birime ait kayıtlı ürünler olduğundan silinemez.' }, 400);
    }

    const deleted = await Unit.findByIdAndDelete(unitId);
    if (!deleted) return c.json({ error: 'Birim bulunamadı.' }, 404);
    return c.json({ message: 'Birim başarıyla silindi.' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/units/:id/products - Birime ait ürünleri listeleme
unitRoutes.get('/:id/products', async (c) => {
  try {
    const unitId = c.req.param('id');
    const products = await Product.find({ unitId: unitId as any, status: { $ne: ProductStatus.DELETED } }).populate('unitId');
    return c.json(products);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
