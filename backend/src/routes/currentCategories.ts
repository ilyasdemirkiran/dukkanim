import { Hono } from 'hono';
import { CurrentCategory } from '../models/CurrentCategory';
import { CurrentAccount } from '../models/CurrentAccount';
import { authMiddleware } from '../middleware/auth';

export const currentCategoryRoutes = new Hono();

currentCategoryRoutes.use('*', authMiddleware);

// GET /api/current-categories - Listele
currentCategoryRoutes.get('/', async (c) => {
  try {
    const categories = await CurrentCategory.find().sort({ name: 1 });
    return c.json(categories);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/current-categories - Ekle
currentCategoryRoutes.post('/', async (c) => {
  try {
    const { name, description } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: 'Cari kategori adı zorunludur.' }, 400);
    }

    const trimmed = name.trim();
    const existing = await CurrentCategory.findOne({ name: trimmed });
    if (existing) {
      return c.json({ error: 'Bu kategori zaten mevcut.' }, 400);
    }

    const category = await CurrentCategory.create({
      name: trimmed,
      description: description?.trim(),
    });

    return c.json(category, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/current-categories/:id - Güncelle
currentCategoryRoutes.put('/:id', async (c) => {
  try {
    const { name, description } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: 'Cari kategori adı zorunludur.' }, 400);
    }

    const updated = await CurrentCategory.findByIdAndUpdate(
      c.req.param('id'),
      { name: name.trim(), description: description?.trim() },
      { new: true }
    );
    if (!updated) return c.json({ error: 'Kategori bulunamadı.' }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/current-categories/:id - Sil
currentCategoryRoutes.delete('/:id', async (c) => {
  try {
    const categoryId = c.req.param('id');
    const accountsCount = await CurrentAccount.countDocuments({ categoryId });
    if (accountsCount > 0) {
      return c.json({ error: 'Bu kategoriye bağlı cariler bulunduğu için silinemez.' }, 400);
    }

    const deleted = await CurrentCategory.findByIdAndDelete(categoryId);
    if (!deleted) return c.json({ error: 'Kategori bulunamadı.' }, 404);
    return c.json({ message: 'Kategori silindi.' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
