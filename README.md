# Özyurt Zahire - Geliştirici & Sistem Durum Defteri (README.md)

> **Kritik Kural:** Bu dosya projenin canlı hafızasıdır. Her yeni istek, geliştirme ve eklenen özellikten sonra bu doküman ve [`PROJECT_REFERENCE.md`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/PROJECT_REFERENCE.md) güncel tutulacaktır.

---

## 📌 Proje Durumu: AKTİF & ÇALIŞIYOR

- **Son Güncelleme:** 2026-10-19 15:12
- **Firma:** Özyurt Zahire
- **Cari Hesap Detay Ekranı & Ayrılmış Form Mimarisi:**
  - Cari Detay yönetimi için bağımsız **[`CurrentAccountDetailScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/CurrentAccountDetailScreen.tsx)** ekranı oluşturuldu.
  - Cari detayında firma bilgileri ve iletişim kartları varsayılan olarak **okuma/görüntüleme** modunda listelenir.
  - Firma bilgisi ekleme/düzenleme veya iletişim kişisi ekleme/düzenleme aksiyonları tıklandığında **Modal** içinde açılır.
  - Tüm formlar React Hook Form (`useForm`, `<Controller>`) ile bağımsız bileşenler olarak ayrıştırıldı:
    - **[`CreateAccountForm.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/forms/CreateAccountForm.tsx):** Cari hesabı oluşturma formu (Kategori seçimi, otomatik ünvan desteği ve notlar).
    - **[`CompanyForm.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/forms/CompanyForm.tsx):** İl/İlçe LocationPicker entegreli resmi firma bilgileri formu.
    - **[`ContactModalForm.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/forms/ContactModalForm.tsx):** `FormPhoneInput` ve `libphonenumber-js` validasyonlu kişi kartı ekleme/düzenleme formu.
    - Backend'e iletişim kartı güncelleme için `PUT /api/current-accounts/:id/contacts/:contactId` endpoint'i ve frontend hook'u eklendi.
- **Satış Detay Ekranı & Ürün Kalemi Modal Yönetimi:**
  - Satış Detay yönetimi için bağımsız **[`SaleDetailScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/SaleDetailScreen.tsx)** ekranı ve modal içinde reaktif birim rozetli [`SaleItemModalForm.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/forms/SaleItemModalForm.tsx) çalışıyor.
- **Satış Kodu:** `Satış-2026-<count>` formatında ardışık sayaçla oluşturuluyor.
- **Ürünler Ekranı (ProductsScreen) Form Mimarisi:**
  - Dağınık `useState` form alanları tamamen kaldırılarak **`react-hook-form` (`useForm`, `Controller`)** mimarisine geçirildi.
  - Kod içerisindeki tüm `any` kullanımları temizlendi, [`src/types/product.ts`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/types/product.ts) altında `Product`, `Unit`, `ProductStatus`, `ProductFormData` tipleri tanımlandı.
- **Cari Detay Geliştirmesi:** "Firma Bilgileri" ve "İletişim Kişileri Kartları" alanları **Collapsible (Akordiyon / Açılır-Kapanır)** yapıldı. İletişim kişisi ekleme formuna `FormPhoneInput` entegre edilerek `libphonenumber-js` validasyonu bağlandı.
- **Backend Durumu:** Docker Container (`dukkanim_backend`) çalışıyor - Port: `4444`
- **Veritabanı Durumu:** Docker Container (`dukkanim_mongodb`) çalışıyor - Port: **`27888`** (.env korumalı)
- **Frontend Durumu:** Expo + TypeScript + TanStack Query + Axios hazır. `bun run tsc --noEmit` 0 hata ile geçiyor.

---

## 🗂️ Tamamlanan Görevler & Geliştirme Özeti

### 1. Backend (Bun + Hono + MongoDB + Docker)
- [x] Tüm eski dizinler temizlenip sıfırdan Bun + Hono TypeScript projesi kuruldu.
- [x] Dockerfile ve docker-compose yapılandırıldı, Port 4444'e yönlendirildi.
- [x] **User Modeli & 30 Günlük JWT:** Telefon numarası unique olacak şekilde bcrypt hashleme ile auth akışı kuruldu.
- [x] **Birimler (Unit):** Sadece `name` alanı ile CRUD ve birime ait ürünleri listeleme endpoint'i yapıldı.
- [x] **Cari Kategorileri:** Kategori modeli ve CRUD operasyonları.
- [x] **Cari Hesaplar (CurrentAccount):**
  - Sadece kategori seçerek anında cari açabilme.
  - Cari detayında **1 adet firma bilgisi** (İl, İlçe, Açık Adres, Vergi Dairesi/No).
  - Cari detayında **birden fazla iletişim kartı** (Ad Soyad, Telefon, Yetki/Görev, Açıklama).
- [x] **Ürünler (Product):**
  - Fiyatlar integer kuruş (son iki hane kuruş) olarak saklanıyor.
  - Soft delete mekanizması (`status: 'DELETED'`) entegre edildi.
- [x] **Satışlar (Sale):**
  - Satış oluşturma ve içine ürün nesnesini gömme (`snapshot`).
  - Kalem bazında yüzde veya tutar indirimi.
  - Kalem bazında KDV oranı.
  - **Toplu KDV ve Toplu İndirim:** Tek tıkla tüm fatura kalemlerini baştan hesaplayan `POST /api/sales/:id/apply-bulk`.

### 2. Frontend (React Native + Expo + TypeScript)
- [x] Expo TypeScript projesi başlatıldı.
- [x] NativeWind / Tailwind CSS ile Osmanlı yakut bordosu, altın varak ve antika kağıt teması oluşturuldu.
- [x] Arka plan için vektörel Osmanlı motifleri ve Tuğra logosu hazırlandı ([`OttomanGraphics.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/OttomanGraphics.tsx)).
- [x] İlk giriş ekranına firma adı **"Özyurt Zahire"** belirgin şekilde yerleştirildi.
- [x] `libphonenumber-js` ile React Hook Form uyumlu TypeScript telefon giriş bileşeni yapıldı ([`FormPhoneInput.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/FormPhoneInput.tsx)).
- [x] Türkiye'nin tüm illeri ve ilçelerini içeren yerel JSON veri seti indirilip arama özellikli modal seçici entegre edildi ([`LocationPicker.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/LocationPicker.tsx)).
- [x] Satışlar, Ürünler, Cariler, Tanımlar ekranları ve alt menü navigasyonu tamamlandı.

---

## 🧭 Hızlı Referans Linkleri

- Detaylı Proje Referans Kılavuzu: [`PROJECT_REFERENCE.md`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/PROJECT_REFERENCE.md)
- Backend Giriş: [`backend/src/index.ts`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/backend/src/index.ts)
- Frontend Giriş: [`frontend/App.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/App.tsx)
- Docker Yapılandırması: [`docker-compose.yml`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/docker-compose.yml)

---

## 🔄 AI Agent Geliştirme Taahhüdü
> Projede yapılan her değişiklik, eklenen her yeni model, API rotası veya ekran sonrasında bu dosya ve `PROJECT_REFERENCE.md` güncellenecektir.
