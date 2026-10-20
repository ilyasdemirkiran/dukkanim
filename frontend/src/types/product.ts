export interface Unit {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductStatus = 'ACTIVE' | 'PASSIVE' | 'DELETED';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number; // Integer kuruş
  unitId: {
    _id: string;
    name: string;
  } | any;
  barcode?: string;
  stockQuantity: number;
  vatRate: number;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  priceTL: string;
  unitId: string;
  stockQuantity: string;
  vatRate: string;
  status: ProductStatus;
}
