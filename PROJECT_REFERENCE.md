# Özyurt Zahire - Ön Muhasebe & Ticaret Yönetim Sistemi (Referans Kılavuzu)

Bu doküman, **Özyurt Zahire** projesinin tüm mimarisini, veri modellerini, iş kurallarını, uç noktalarını (endpoints) ve frontend bileşenlerini detaylı olarak açıklayan ana başvuru kaynağıdır.

---

## 🏛️ 1. Proje Genel Bakışı & Teknoloji Yığını

- **Amaç:** Zahirecilik, hububat ve tarımsal ticaret yapan işletmeler (Özyurt Zahire) için özel olarak geliştirilmiş modern, hızlı, mobil ve web uyumlu ön muhasebe sistemi.
- **Tasarım Konsepti:** Trabzon doğasından ilham alan, güven veren, sade ve profesyonel renk paleti:
  - **Ana Renkler:** Karadeniz Mavisi (`#0B4F6C`), Kıyı Mavisi (`#1E7BB6`), Açık Mavi Zemin (`#D6EAF8`).
  - **İkincil / Vurgu:** Doğa Yeşili (`#10B981`), Fındık Yeşili (`#34A853`), Zeytin Yeşili (`#6B8F71`).
  - **Nötr & Zemin:** Koyu Gri (`#1F2937`), Orta Gri (`#475569`), Gri Çerçeve (`#94A3B8`), Açık Zemin (`#F8FAFC`).
  - **Uyarı & Hata:** Amber (`#F59E0B`), Kırmızı (`#EF4444`), Mor Accent (`#8B5CF6`).

### Teknoloji Mimarisi
| Katman | Teknoloji / Kütüphaneler | Çalışma Ortamı |
| :--- | :--- | :--- |
| **Backend API** | Bun + Hono.js + Mongoose + JWT + Bcrypt | Docker (Port: 4444) |
| **Veritabanı** | MongoDB 7.0 (Özel Port & Auth) | Docker (`dukkanim_mongodb` / Port: **27888**) |
| **Mobil / Web Frontend** | React Native (Expo SDK 58) + TypeScript | iOS / Android / Web |
| **Veri & İstek Katmanı** | **TanStack Query (`@tanstack/react-query`) + Axios** | Frontend (Önbellek & Revalidation) |
| **Form & Validasyon** | React Hook Form (TypeScript) + libphonenumber-js | Frontend |
| **Stil & Vektör** | NativeWind / Tailwind CSS + react-native-svg + Lucide Icons | Frontend |

---

## ⚙️ 2. Temel İş Kuralları & Mimari Kararlar

1. **Fiyatlar ve Para Birimi:**
   - Ürün fiyatları ve satış tutarları veritabanında **kuruş cinsinden `integer` (tamsayı)** olarak saklanır (Örn: `850.50 TL` -> `85050 kuruş`).
   - Bu sayede JavaScript ondalık basamak (floating point) yuvarlama hataları engellenir.
2. **Kullanıcı Kayıt & Giriş:**
   - Kullanıcılar sadece **Telefon Numarası** ve **Şifre** ile kayıt olur.
   - Telefon numaraları sistemde `unique`tir.
   - JWT token süresi **30 gün** olarak yapılandırılmıştır.
3. **Ürünler & Soft Delete:**
   - Ürünler sistemden tamamen fiziksel olarak silinmez (`ProductStatus.DELETED`).
   - `DELETE` isteği yapıldığında durumu pasife/silindiye çekilir; böylece geçmiş fatura ve raporların tutarlılığı korunur.
4. **Cari Hesap Oluşturma Akışı:**
   - Cari oluştururken **sadece Cari Kategorisi ve Ünvan seçimi zorunludur**.
   - Cari oluştuktan sonra cari detayında:
     - **1 adet Firma Bilgisi** (Resmi ünvan, İl, İlçe, Açık Adres, Vergi Dairesi/No).
     - **Birden fazla İletişim Kartı** (Ad Soyad, Telefon, Görev/Yetki, Açıklama).
5. **Türkiye İl-İlçe Veri Seti:**
   - `turkeyLocations.json` dosyası üzerinden tüm 81 il ve bağlı ilçeleri, aranabilir modal picker ile opsiyonel olarak seçilebilir.
6. **Satışlar & Gömülü (Embedded) Obje Mimarisi:**
   - Satışa ürün eklendiğinde, ürünün o anki fiyatı, birimi ve anlık verileri satış belgesine gömülür (`snapshot`). Ürün gelecekte güncellense bile geçmiş satışın faturası bozulmaz.
   - **Kalem Bazında İndirim:** Yüzdelik (`%`) veya doğrudan Tutar (kuruş) olarak uygulanabilir.
   - **Kalem Bazında KDV:** Her kalemin KDV oranı ayrı ayrı hesaplanır.
   - **Toplu İndirim & Toplu KDV:** Faturadaki tüm ürün kalemlerine tek tıkla toplu indirim ve toplu KDV uygulanabilir.

---

## 🗄️ 3. Veri Modelleri (Schema Özeti)

### 3.1. User (Kullanıcı)
- `phone`: String (Unique, zorunlu)
- `passwordHash`: String (Bcrypt)
- `fullName`: String (Opsiyonel)

### 3.2. Unit (Birim)
- `name`: String (Unique, örn: "Çuval (50 Kg)", "Kg", "Ton")

### 3.3. CurrentCategory (Cari Kategorisi)
- `name`: String (Örn: "Müstahsil / Çiftçi", "Fabrika", "Tüccar")
- `description`: String (Opsiyonel)

### 3.4. CurrentAccount (Cari Hesap)
- `title`: String (Zorunlu)
- `categoryId`: ObjectId (Ref: `CurrentCategory`, Zorunlu)
- `company`: Obje (1 Adet, Opsiyonel)
  - `companyName`, `city`, `district`, `address`, `taxNumber`, `taxOffice`
- `contacts`: Dizi (`[IContactPerson]`)
  - `fullName`, `phone`, `duty`, `description`, `createdAt`
- `notes`: String (Opsiyonel)

### 3.5. Product (Ürün)
- `name`: String (Zorunlu)
- `description`: String (Opsiyonel)
- `price`: Number (Integer kuruş, Zorunlu)
- `unitId`: ObjectId (Ref: `Unit`, Zorunlu)
- `barcode`: String (Opsiyonel)
- `stockQuantity`: Number
- `vatRate`: Number (Örn: 1, 10, 20)
- `status`: Enum (`'ACTIVE'`, `'PASSIVE'`, `'DELETED'`)

### 3.6. Sale (Satış Faturası)
- `saleNumber`: String (Benzersiz fiş/fatura numarası, örn: `SAT-1792405442530`)
- `currentAccountId`: ObjectId (Ref: `CurrentAccount`)
- `currentAccountSnapshot`: Obje (Cari anlık görüntüsü)
- `items`: Dizi (`[ISaleItem]`)
  - `productId`, `productName`, `unitName`, `unitPrice` (kuruş), `quantity`
  - `discountType`: Enum (`'PERCENTAGE'`, `'AMOUNT'`)
  - `discountValue`: Number
  - `discountAmount`: Number (Hesaplanan kuruş)
  - `vatRate`: Number, `vatAmount`: Number (Hesaplanan kuruş)
  - `grossTotal`, `netTotal` (kuruş)
  - `snapshot`: Any (Ürünün o anki tüm nesnesi)
- `bulkDiscountType`, `bulkDiscountValue`, `bulkVatRate`
- `totalGross`, `totalDiscount`, `totalVat`, `grandTotal` (kuruş)
- `note`: String
- `status`: Enum (`'DRAFT'`, `'COMPLETED'`, `'CANCELLED'`)

---

## 📡 4. Backend API Endpoints (Port 4444)

| Metot | Uç Nokta | Açıklama |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Telefon + şifre ile yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Giriş yap ve 30 günlük JWT al |
| `GET / POST` | `/api/units` | Birimleri listele / Yeni birim oluştur |
| `GET / PUT / DELETE`| `/api/units/:id` | Birim detay / güncelle / sil |
| `GET` | `/api/units/:id/products`| Birime ait ürünleri listele |
| `GET / POST` | `/api/current-categories`| Cari kategorilerini listele / oluştur |
| `GET / POST` | `/api/current-accounts` | Carileri listele / Sadece kategori ile cari oluştur |
| `GET / PUT / DELETE`| `/api/current-accounts/:id` | Cari detay / güncelle / sil |
| `PUT` | `/api/current-accounts/:id/company` | Cariye 1 adet firma bilgisi ekle/güncelle |
| `POST` | `/api/current-accounts/:id/contacts` | Cariye yeni iletişim kartı ekle |
| `DELETE` | `/api/current-accounts/:id/contacts/:contactId` | Cariden iletişim kartı sil |
| `GET / POST` | `/api/products` | Ürünleri listele / Kuruş cinsinden ürün ekle |
| `GET / PUT / DELETE`| `/api/products/:id` | Ürün detay / güncelle / soft delete |
| `GET / POST` | `/api/sales` | Satışları listele / Cari seçerek yeni satış aç |
| `GET / PUT / DELETE`| `/api/sales/:id` | Satış detay / güncelle / sil |
| `POST` | `/api/sales/:id/items` | Satışa gömülü ürün kalemi ekle |
| `PUT / DELETE` | `/api/sales/:id/items/:itemId` | Kalemi güncelle (miktar/indirim/kdv) / sil |
| `POST` | `/api/sales/:id/apply-bulk` | Faturaya **Toplu İndirim ve KDV** uygula |

---

## 📱 5. Frontend Dosya Yapısı & Ekranlar

- [`App.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/App.tsx): Oturum yönetimi, üst bar (Özyurt Zahire + kullanıcı selamlama + çıkış), alt tab bar.
- [`src/screens/AuthScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/AuthScreen.tsx): "Özyurt Zahire" başlığı, Tuğra logosu, telefon & şifre ile giriş/kayıt ekranı.
- [`src/components/FormPhoneInput.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/FormPhoneInput.tsx): `libphonenumber-js` ve `react-hook-form` uyumlu, `+90` bayraklı maskeli telefon giriş bileşeni.
- [`src/components/OttomanGraphics.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/OttomanGraphics.tsx): Vektörel Osmanlı arka plan deseni (lale, Selçuklu sekizgeni) ve Tuğra amblemi.
- [`src/components/LocationPicker.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/components/LocationPicker.tsx): 81 il ve ilçeyi arama filtreli sunan modal seçici.
- [`src/screens/SalesScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/SalesScreen.tsx): Satış faturası oluşturma, gömülü kalem ekleme, kalem/toplu indirim ve KDV yönetimi.
- [`src/screens/ProductsScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/ProductsScreen.tsx): Birime göre filtreleme, kuruş hesabı, soft delete desteği.
- [`src/screens/CurrentAccountsScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/CurrentAccountsScreen.tsx): Hızlı cari ekleme, firma bilgisi düzenleme, çoklu yetkili kişi kartları.
- [`src/screens/CategoriesAndUnitsScreen.tsx`](file:///Users/ilyasdemirkiran/Documents/projects/dukkanim/frontend/src/screens/CategoriesAndUnitsScreen.tsx): Birimler ve cari kategorileri CRUD sekmeleri.

---

## 🚀 6. Kurulum ve Çalıştırma Rehberi

### 1. Docker ile Backend & Veritabanı
```bash
# Proje kök dizininde:
docker compose up -d

# Logları izlemek için:
docker logs -f dukkanim_backend
```
Backend `http://localhost:4444` adresinde hazır olacaktır.

### 2. Frontend'i Başlatma
```bash
cd frontend
bun run start
# Web üzerinde hemen test etmek için:
bun run web
```
