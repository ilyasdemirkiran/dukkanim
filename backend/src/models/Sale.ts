import mongoose, { Schema, Document } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE', // Yüzde (%)
  AMOUNT = 'AMOUNT', // Doğrudan tutar indirimi (kuruş cinsinden)
}

// Satış içerisindeki gömülü ürün kalemi
export interface ISaleItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  unitName?: string;
  unitPrice: number; // Kuruş cinsinden orijinal ürün birim fiyatı
  quantity: number; // Miktar
  
  // Kalem bazında İndirim
  discountType: DiscountType;
  discountValue: number; // Yüzde ise 10 (%10), Tutar ise kuruş (örn 5000 = 50 TL)
  discountAmount: number; // Hesaplanmış toplam indirim tutarı (kuruş)
  
  // Kalem bazında KDV
  vatRate: number; // KDV yüzdesi örn: 1, 10, 20
  vatAmount: number; // Hesaplanmış KDV tutarı (kuruş)
  
  grossTotal: number; // (unitPrice * quantity) kuruş
  netTotal: number; // grossTotal - discountAmount + vatAmount (kuruş)
  
  snapshot: any; // Ürünün eklenme anındaki tüm bilgileri gömülü obje olarak
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    unitName: { type: String },
    unitPrice: { type: Number, required: true }, // kuruş
    quantity: { type: Number, required: true, default: 1 },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      default: DiscountType.PERCENTAGE,
    },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    vatRate: { type: Number, default: 20 },
    vatAmount: { type: Number, default: 0 },
    grossTotal: { type: Number, default: 0 },
    netTotal: { type: Number, default: 0 },
    snapshot: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

export enum SaleStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ISale extends Document {
  saleNumber: string; // Fatura / Fiş No
  currentAccountId: mongoose.Types.ObjectId; // Cari seçimi
  currentAccountSnapshot?: any; // Cari detay anlık görüntüsü
  items: ISaleItem[];
  
  // Toplu Uygulanan İndirim & KDV değerleri
  bulkDiscountType?: DiscountType;
  bulkDiscountValue?: number;
  bulkVatRate?: number;
  
  // Genel Toplamlar (kuruş cinsinden)
  totalGross: number; // İndirimsiz ham toplam
  totalDiscount: number; // Toplam indirim tutarı
  totalVat: number; // Toplam KDV tutarı
  grandTotal: number; // Ödenecek nihai genel toplam
  
  note?: string;
  status: SaleStatus;
  date: string; // LocalDate format: 'YYYY-MM-DD'
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    currentAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'CurrentAccount',
      required: true,
    },
    currentAccountSnapshot: {
      type: Schema.Types.Mixed,
      default: {},
    },
    items: {
      type: [SaleItemSchema],
      default: [],
    },
    bulkDiscountType: {
      type: String,
      enum: Object.values(DiscountType),
    },
    bulkDiscountValue: {
      type: Number,
      default: 0,
    },
    bulkVatRate: {
      type: Number,
    },
    totalGross: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalVat: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.COMPLETED,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Sale = mongoose.model<ISale>('Sale', SaleSchema);
