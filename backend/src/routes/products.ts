import { Hono } from 'hono';
import { Product, ProductStatus } from '../models/Product';
import { authMiddleware } from '../middleware/auth';

export const productRoutes = new Hono();

productRoutes.use('*', authMiddleware);

// GET /api/products - Ürünleri listele (Soft delete olanları getirme)
productRoutes.get('/', async (c) => {
  try {
    const { unitId, search, status } = c.req.query();
    const filter: any = {};

    // Varsayılan olarak DELETED olmayanları getir
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: ProductStatus.DELETED };
    }

    if (unitId) {
      filter.unitId = unitId;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter).populate('unitId').sort({ createdAt: -1 });
    return c.json(products);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/products/:id - Ürün detayı
productRoutes.get('/:id', async (c) => {
  try {
    const product = await Product.findById(c.req.param('id')).populate('unitId');
    if (!product || product.status === ProductStatus.DELETED) {
      return c.json({ error: 'Ürün bulunamadı.' }, 404);
    }
    return c.json(product);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/products - Yeni Ürün Oluştur
// price integer kuruş olarak kaydedilecek (Örn: 150.50 TL -> 15050 kuruş)
productRoutes.post('/', async (c) => {
  try {
    const { name, description, price, unitId, barcode, stockQuantity, vatRate, status } = await c.req.json();

    if (!name || !name.trim()) {
      return c.json({ error: 'Ürün adı zorunludur.' }, 400);
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      return c.json({ error: 'Geçerli bir fiyat girilmelidir (kuruş cinsinden tamsayı).' }, 400);
    }
    if (!unitId) {
      return c.json({ error: 'Birim seçimi zorunludur.' }, 400);
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim(),
      price: Math.round(Number(price)), // Kuruş tamsayı garanti edilir
      unitId,
      barcode: barcode?.trim(),
      stockQuantity: Number(stockQuantity) || 0,
      vatRate: vatRate !== undefined ? Number(vatRate) : 20,
      status: status || ProductStatus.ACTIVE,
    });

    const populated = await Product.findById(product._id).populate('unitId');
    return c.json(populated, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/products/:id - Ürün Güncelle
productRoutes.put('/:id', async (c) => {
  try {
    const { name, description, price, unitId, barcode, stockQuantity, vatRate, status } = await c.req.json();

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Math.round(Number(price));
    if (unitId) updateData.unitId = unitId;
    if (barcode !== undefined) updateData.barcode = barcode.trim();
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity);
    if (vatRate !== undefined) updateData.vatRate = Number(vatRate);
    if (status) updateData.status = status;

    const updated = await Product.findByIdAndUpdate(
      c.req.param('id'),
      updateData,
      { new: true }
    ).populate('unitId');

    if (!updated) return c.json({ error: 'Ürün bulunamadı.' }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/products/:id - Ürün Tamamen Silinmez, Durumu DELETED yapılır (Soft delete)
productRoutes.delete('/:id', async (c) => {
  try {
    const product = await Product.findById(c.req.param('id'));
    if (!product) return c.json({ error: 'Ürün bulunamadı.' }, 404);

    product.status = ProductStatus.DELETED;
    await product.save();

    return c.json({ message: 'Ürün silindi (status: DELETED olarak güncellendi).' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
