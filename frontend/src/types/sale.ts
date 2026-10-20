import { CurrentAccount } from './currentAccount';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export interface SaleItem {
  _id?: string;
  productId: string;
  productName: string;
  unitName?: string;
  unitPrice: number;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  grossTotal: number;
  netTotal: number;
  snapshot?: any;
}

export type SaleStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface Sale {
  _id: string;
  saleNumber: string;
  currentAccountId: CurrentAccount | any;
  currentAccountSnapshot?: {
    _id: string;
    code: number;
    title: string;
  };
  items: SaleItem[];
  bulkDiscountType?: DiscountType;
  bulkDiscountValue?: number;
  bulkVatRate?: number;
  totalGross: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
  note?: string;
  status: SaleStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalePayload {
  currentAccountId: string;
  note?: string;
  date?: string; // LocalDate format: 'YYYY-MM-DD'
}

export interface AddSaleItemPayload {
  productId: string;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
  vatRate: number;
}

export interface ApplyBulkPayload {
  bulkDiscountType: DiscountType;
  bulkDiscountValue: number;
  bulkVatRate: number;
}
