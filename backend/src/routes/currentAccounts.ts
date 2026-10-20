import { Hono } from 'hono';
import { CurrentAccount } from '../models/CurrentAccount';
import { CurrentCategory } from '../models/CurrentCategory';
import { getNextSequence } from '../models/Counter';
import { authMiddleware } from '../middleware/auth';

export const currentAccountRoutes = new Hono();

currentAccountRoutes.use('*', authMiddleware);

// GET /api/current-accounts - Listele (Arama & filtreleme destekli)
currentAccountRoutes.get('/', async (c) => {
  try {
    const { categoryId, search } = c.req.query();
    const filter: any = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      // Başlık veya cari koduna göre arama
      const numSearch = Number(search);
      if (!isNaN(numSearch)) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { code: numSearch },
        ];
      } else {
        filter.title = { $regex: search, $options: 'i' };
      }
    }

    const accounts = await CurrentAccount.find(filter)
      .populate('categoryId')
      .sort({ code: -1 });

    return c.json(accounts);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/current-accounts/next-code - Bir sonraki cari kodunu önizleme
currentAccountRoutes.get('/next-code', async (c) => {
  try {
    const lastAccount = await CurrentAccount.findOne().sort({ code: -1 });
    const nextCode = (lastAccount?.code || 0) + 1;
    return c.json({ nextCode });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/current-accounts/:id - Cari Detay
currentAccountRoutes.get('/:id', async (c) => {
  try {
    const account = await CurrentAccount.findById(c.req.param('id')).populate('categoryId');
    if (!account) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);
    return c.json(account);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/current-accounts - Cari Ekle (Auto Increment integer code & Otomatik Ünvan)
currentAccountRoutes.post('/', async (c) => {
  try {
    const { title, categoryId, notes, company, contacts } = await c.req.json();

    if (!categoryId) {
      return c.json({ error: 'Cari kategorisi seçilmelidir.' }, 400);
    }

    const category = await CurrentCategory.findById(categoryId);
    if (!category) {
      return c.json({ error: 'Seçilen kategori bulunamadı.' }, 404);
    }

    // SQL identity gibi auto-increment integer kod üret
    const code = await getNextSequence('current_account_code');

    // Başlık girilmemişse kategori ve otomatik kod ile ünvan oluştur (Örn: "Müstahsil / Çiftçi #101" veya "Cari Hesap #101")
    let finalTitle = title?.trim();
    if (!finalTitle) {
      finalTitle = `${category.name} #${code}`;
    }

    const account = await CurrentAccount.create({
      code,
      title: finalTitle,
      categoryId,
      notes: notes?.trim(),
      company: company || {},
      contacts: contacts || [],
    });

    const populated = await CurrentAccount.findById(account._id).populate('categoryId');
    return c.json(populated, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/current-accounts/:id - Cari Güncelle
currentAccountRoutes.put('/:id', async (c) => {
  try {
    const { title, categoryId, notes } = await c.req.json();
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (categoryId) updateData.categoryId = categoryId;
    if (notes !== undefined) updateData.notes = notes.trim();

    const updated = await CurrentAccount.findByIdAndUpdate(
      c.req.param('id'),
      updateData,
      { new: true }
    ).populate('categoryId');

    if (!updated) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/current-accounts/:id - Cari Sil
currentAccountRoutes.delete('/:id', async (c) => {
  try {
    const deleted = await CurrentAccount.findByIdAndDelete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);
    return c.json({ message: 'Cari hesap silindi.' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/current-accounts/:id/company - Cari detayında firma bilgisi ekleme / güncelleme
currentAccountRoutes.put('/:id/company', async (c) => {
  try {
    const { companyName, city, district, address, taxNumber, taxOffice } = await c.req.json();
    const account = await CurrentAccount.findById(c.req.param('id'));
    if (!account) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);

    account.company = {
      companyName: companyName?.trim(),
      city: city?.trim(),
      district: district?.trim(),
      address: address?.trim(),
      taxNumber: taxNumber?.trim(),
      taxOffice: taxOffice?.trim(),
    };

    await account.save();
    return c.json(account);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/current-accounts/:id/contacts - Cariye iletişim kişisi ekleme
currentAccountRoutes.post('/:id/contacts', async (c) => {
  try {
    const { fullName, phone, duty, description } = await c.req.json();
    if (!fullName || !phone) {
      return c.json({ error: 'İletişim kişisi ad-soyad ve telefon zorunludur.' }, 400);
    }

    const account = await CurrentAccount.findById(c.req.param('id'));
    if (!account) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);

    account.contacts.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      duty: duty?.trim(),
      description: description?.trim(),
    });

    await account.save();
    return c.json(account);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/current-accounts/:id/contacts/:contactId - İletişim kartını güncelleme
currentAccountRoutes.put('/:id/contacts/:contactId', async (c) => {
  try {
    const { id, contactId } = c.req.param();
    const { fullName, phone, duty, description } = await c.req.json();
    const account = await CurrentAccount.findById(id);
    if (!account) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);

    const contact = (account.contacts as any).id(contactId);
    if (!contact) return c.json({ error: 'İletişim kişisi bulunamadı.' }, 404);

    if (fullName) contact.fullName = fullName.trim();
    if (phone) contact.phone = phone.trim();
    if (duty !== undefined) contact.duty = duty?.trim();
    if (description !== undefined) contact.description = description?.trim();

    await account.save();
    return c.json(account);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/current-accounts/:id/contacts/:contactId - İletişim kartını silme
currentAccountRoutes.delete('/:id/contacts/:contactId', async (c) => {
  try {
    const { id, contactId } = c.req.param();
    const account = await CurrentAccount.findById(id);
    if (!account) return c.json({ error: 'Cari hesap bulunamadı.' }, 404);

    account.contacts = (account.contacts as any).filter((item: any) => item._id.toString() !== contactId);
    await account.save();
    return c.json(account);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
