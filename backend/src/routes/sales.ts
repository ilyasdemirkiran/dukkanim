import { Hono } from 'hono';
import { Sale, DiscountType, SaleStatus, type ISaleItem } from '../models/Sale';
import { Product, ProductStatus } from '../models/Product';
import { CurrentAccount } from '../models/CurrentAccount';
import { Counter, getNextSequence } from '../models/Counter';
import { authMiddleware } from '../middleware/auth';
import { calculateSaleItem, calculateSaleTotals } from '../utils/salesCalculator';

export const saleRoutes = new Hono();

saleRoutes.use('*', authMiddleware);

// GET /api/sales - Satışları Listele
saleRoutes.get('/', async (c) => {
  try {
    const { currentAccountId, status, search, date } = c.req.query();
    const filter: any = {};

    if (currentAccountId) filter.currentAccountId = currentAccountId;
    if (status) filter.status = status;
    if (date) filter.date = date; // 'YYYY-MM-DD'
    if (search) {
      filter.saleNumber = { $regex: search, $options: 'i' };
    }

    const sales = await Sale.find(filter)
      .populate('currentAccountId')
      .sort({ createdAt: -1 });

    return c.json(sales);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/sales/:id - Satış Detayı
saleRoutes.get('/:id', async (c) => {
  try {
    const sale = await Sale.findById(c.req.param('id')).populate('currentAccountId');
    if (!sale) return c.json({ error: 'Satış faturası bulunamadı.' }, 404);
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/sales - Yeni Satış Başlat (Cari seçimi ve isteğe bağlı ürünler)
saleRoutes.post('/', async (c) => {
  try {
    const { currentAccountId, items: rawItems, note, saleNumber: customSaleNumber, date: customDate } = await c.req.json();

    if (!currentAccountId) {
      return c.json({ error: 'Cari seçimi zorunludur.' }, 400);
    }

    const currentAccount = await CurrentAccount.findById(currentAccountId).populate('categoryId');
    if (!currentAccount) {
      return c.json({ error: 'Seçilen cari bulunamadı.' }, 404);
    }

    // Fatura numarası oluştur: Satış-YYYY-<count>
    const currentYear = new Date().getFullYear();
    let saleNumber = customSaleNumber?.trim();
    if (!saleNumber) {
      const count = await getNextSequence(`sale_${currentYear}`);
      saleNumber = `Satış-${currentYear}-${count}`;
    }

    const processedItems: ISaleItem[] = [];

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      for (const itemInput of rawItems) {
        const product = await Product.findById(itemInput.productId).populate('unitId');
        if (!product || product.status === ProductStatus.DELETED) {
          return c.json({ error: `Ürün bulunamadı veya silinmiş: ${itemInput.productId}` }, 400);
        }

        const calculated = calculateSaleItem(product, {
          quantity: itemInput.quantity,
          discountType: itemInput.discountType,
          discountValue: itemInput.discountValue,
          vatRate: itemInput.vatRate,
        });

        processedItems.push(calculated);
      }
    }

    const totals = calculateSaleTotals(processedItems);

    // LocalDate format (YYYY-MM-DD)
    const saleDate = customDate && /^\d{4}-\d{2}-\d{2}$/.test(customDate.trim())
      ? customDate.trim()
      : new Date().toISOString().split('T')[0];

    const sale = await Sale.create({
      saleNumber,
      currentAccountId,
      currentAccountSnapshot: currentAccount.toObject ? currentAccount.toObject() : currentAccount,
      items: processedItems,
      totalGross: totals.totalGross,
      totalDiscount: totals.totalDiscount,
      totalVat: totals.totalVat,
      grandTotal: totals.grandTotal,
      note: note?.trim(),
      date: saleDate,
      status: SaleStatus.COMPLETED,
    });

    const populated = await Sale.findById(sale._id).populate('currentAccountId');
    return c.json(populated, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/sales/:id - Satış Genel Bilgilerini Güncelle (Not, Fatura no vb.)
saleRoutes.put('/:id', async (c) => {
  try {
    const { note, saleNumber, status } = await c.req.json();
    const updateData: any = {};
    if (note !== undefined) updateData.note = note.trim();
    if (saleNumber) updateData.saleNumber = saleNumber.trim();
    if (status) updateData.status = status;

    const sale = await Sale.findByIdAndUpdate(c.req.param('id'), updateData, { new: true }).populate('currentAccountId');
    if (!sale) return c.json({ error: 'Satış bulunamadı.' }, 404);
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/sales/:id - Satışı İptal Et veya Sil
saleRoutes.delete('/:id', async (c) => {
  try {
    const deleted = await Sale.findByIdAndDelete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Satış bulunamadı.' }, 404);
    return c.json({ message: 'Satış kaydı silindi.' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/sales/:id/items - Satışa Yeni Ürün Ekle (Ürün objesini içine gömer)
saleRoutes.post('/:id/items', async (c) => {
  try {
    const { productId, quantity, discountType, discountValue, vatRate } = await c.req.json();

    if (!productId) {
      return c.json({ error: 'Ürün seçimi zorunludur.' }, 400);
    }

    const sale = await Sale.findById(c.req.param('id'));
    if (!sale) return c.json({ error: 'Satış kaydı bulunamadı.' }, 404);

    const product = await Product.findById(productId).populate('unitId');
    if (!product || product.status === ProductStatus.DELETED) {
      return c.json({ error: 'Ürün bulunamadı veya silinmiş.' }, 404);
    }

    const newItem = calculateSaleItem(product, {
      quantity,
      discountType,
      discountValue,
      vatRate,
    });

    sale.items.push(newItem);

    const totals = calculateSaleTotals(sale.items);
    sale.totalGross = totals.totalGross;
    sale.totalDiscount = totals.totalDiscount;
    sale.totalVat = totals.totalVat;
    sale.grandTotal = totals.grandTotal;

    await sale.save();
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/sales/:id/items/:itemId - Ürün Kalemi Güncelleme (Miktar, Kalem İndirimi veya KDV)
saleRoutes.put('/:id/items/:itemId', async (c) => {
  try {
    const { id, itemId } = c.req.param();
    const { quantity, discountType, discountValue, vatRate } = await c.req.json();

    const sale = await Sale.findById(id);
    if (!sale) return c.json({ error: 'Satış kaydı bulunamadı.' }, 404);

    const itemIndex = sale.items.findIndex((it: any) => it._id.toString() === itemId);
    if (itemIndex === -1) {
      return c.json({ error: 'Satış kalemi bulunamadı.' }, 404);
    }

    const currentItem = sale.items[itemIndex];
    if (!currentItem) {
      return c.json({ error: 'Satış kalemi bulunamadı.' }, 404);
    }

    const product = await Product.findById(currentItem.productId).populate('unitId');

    const updatedItem = calculateSaleItem(product || currentItem.snapshot, {
      quantity: quantity !== undefined ? quantity : currentItem.quantity,
      discountType: discountType || currentItem.discountType,
      discountValue: discountValue !== undefined ? discountValue : currentItem.discountValue,
      vatRate: vatRate !== undefined ? vatRate : currentItem.vatRate,
    });

    // Object ID'yi muhafaza et
    (updatedItem as any)._id = currentItem._id;
    sale.items[itemIndex] = updatedItem;

    const totals = calculateSaleTotals(sale.items);
    sale.totalGross = totals.totalGross;
    sale.totalDiscount = totals.totalDiscount;
    sale.totalVat = totals.totalVat;
    sale.grandTotal = totals.grandTotal;

    await sale.save();
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/sales/:id/items/:itemId - Satıştan Kalem Çıkar
saleRoutes.delete('/:id/items/:itemId', async (c) => {
  try {
    const { id, itemId } = c.req.param();
    const sale = await Sale.findById(id);
    if (!sale) return c.json({ error: 'Satış kaydı bulunamadı.' }, 404);

    sale.items = (sale.items as any).filter((it: any) => it._id.toString() !== itemId);

    const totals = calculateSaleTotals(sale.items);
    sale.totalGross = totals.totalGross;
    sale.totalDiscount = totals.totalDiscount;
    sale.totalVat = totals.totalVat;
    sale.grandTotal = totals.grandTotal;

    await sale.save();
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/sales/:id/apply-bulk - TOPLU İNDİRİM & TOPLU KDV UYGULA
saleRoutes.post('/:id/apply-bulk', async (c) => {
  try {
    const { bulkDiscountType, bulkDiscountValue, bulkVatRate } = await c.req.json();

    const sale = await Sale.findById(c.req.param('id'));
    if (!sale) return c.json({ error: 'Satış kaydı bulunamadı.' }, 404);

    if (sale.items.length === 0) {
      return c.json({ error: 'Satışta ürün bulunmuyor.' }, 400);
    }

    // Her bir kaleme toplu indirim / kdv uygula ve baştan hesapla
    for (let i = 0; i < sale.items.length; i++) {
      const item = sale.items[i];
      if (!item) continue;
      const product = await Product.findById(item.productId).populate('unitId');

      const updatedItem = calculateSaleItem(product || item.snapshot, {
        quantity: item.quantity,
        discountType: bulkDiscountType !== undefined ? bulkDiscountType : item.discountType,
        discountValue: bulkDiscountValue !== undefined ? bulkDiscountValue : item.discountValue,
        vatRate: bulkVatRate !== undefined ? bulkVatRate : item.vatRate,
      });

      (updatedItem as any)._id = item._id;
      sale.items[i] = updatedItem;
    }

    if (bulkDiscountType !== undefined) sale.bulkDiscountType = bulkDiscountType;
    if (bulkDiscountValue !== undefined) sale.bulkDiscountValue = bulkDiscountValue;
    if (bulkVatRate !== undefined) sale.bulkVatRate = bulkVatRate;

    const totals = calculateSaleTotals(sale.items);
    sale.totalGross = totals.totalGross;
    sale.totalDiscount = totals.totalDiscount;
    sale.totalVat = totals.totalVat;
    sale.grandTotal = totals.grandTotal;

    await sale.save();
    return c.json(sale);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
