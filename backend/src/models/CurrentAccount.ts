import mongoose, { Schema, Document } from 'mongoose';

// Cari İletişim Kişisi (Birden fazla eklenebilir)
export interface IContactPerson {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  duty?: string; // Yetki / Görev (opt)
  description?: string; // Açıklama (opt)
  createdAt?: Date;
}

const ContactPersonSchema = new Schema<IContactPerson>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    duty: { type: String, trim: true },
    description: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Cari Firma Bilgisi (1 tane eklenebilir, opsiyonel)
export interface ICompanyInfo {
  companyName?: string;
  city?: string; // İl
  district?: string; // İlçe
  address?: string; // Adres
  taxNumber?: string;
  taxOffice?: string;
}

const CompanyInfoSchema = new Schema<ICompanyInfo>(
  {
    companyName: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    address: { type: String, trim: true },
    taxNumber: { type: String, trim: true },
    taxOffice: { type: String, trim: true },
  },
  { _id: false }
);

export interface ICurrentAccount extends Document {
  code: number; // Auto increment integer cari kodu (SQL identity gibi: 1, 2, 3...)
  title: string; // Cari Adı / Ünvanı (Otomatik veya manuel)
  categoryId: mongoose.Types.ObjectId; // Kategori
  company?: ICompanyInfo; // 1 adet firma bilgisi (opsiyonel)
  contacts: IContactPerson[]; // Birden fazla iletişim kartı
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CurrentAccountSchema = new Schema<ICurrentAccount>(
  {
    code: {
      type: Number,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'CurrentCategory',
      required: true,
    },
    company: {
      type: CompanyInfoSchema,
      default: () => ({}),
    },
    contacts: {
      type: [ContactPersonSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CurrentAccount = mongoose.model<ICurrentAccount>('CurrentAccount', CurrentAccountSchema);
