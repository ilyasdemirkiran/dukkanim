import { DiscountType, type ISaleItem } from '../models/Sale';

export interface ProcessItemInput {
  productId: string;
  quantity?: number;
  discountType?: DiscountType;
  discountValue?: number;
  vatRate?: number;
}

export function calculateSaleItem(
  productDoc: any,
  input: {
    quantity?: number;
    discountType?: DiscountType;
    discountValue?: number;
    vatRate?: number;
  }
): ISaleItem {
  const quantity = Math.max(1, Number(input.quantity) || 1);
  const unitPrice = Number(productDoc.price) || 0; // Kuruş
  const grossTotal = unitPrice * quantity; // Kuruş

  const discountType = input.discountType || DiscountType.PERCENTAGE;
  const discountValue = Number(input.discountValue) || 0;

  let discountAmount = 0; // Kuruş
  if (discountType === DiscountType.PERCENTAGE) {
    // Yüzdelik indirim: örn %10
    discountAmount = Math.round((grossTotal * Math.min(100, Math.max(0, discountValue))) / 100);
  } else {
    // Tutar indirimi: kuruş cinsinden
    discountAmount = Math.min(grossTotal, Math.max(0, Math.round(discountValue)));
  }

  const taxableAmount = Math.max(0, grossTotal - discountAmount);
  const vatRate = input.vatRate !== undefined ? Number(input.vatRate) : (productDoc.vatRate ?? 20);
  const vatAmount = Math.round((taxableAmount * vatRate) / 100);
  const netTotal = taxableAmount + vatAmount;

  return {
    productId: productDoc._id,
    productName: productDoc.name,
    unitName: productDoc.unitId?.name || '',
    unitPrice,
    quantity,
    discountType,
    discountValue,
    discountAmount,
    vatRate,
    vatAmount,
    grossTotal,
    netTotal,
    snapshot: productDoc.toObject ? productDoc.toObject() : productDoc,
  };
}

export function calculateSaleTotals(items: ISaleItem[]) {
  let totalGross = 0;
  let totalDiscount = 0;
  let totalVat = 0;
  let grandTotal = 0;

  for (const item of items) {
    totalGross += item.grossTotal;
    totalDiscount += item.discountAmount;
    totalVat += item.vatAmount;
    grandTotal += item.netTotal;
  }

  return {
    totalGross,
    totalDiscount,
    totalVat,
    grandTotal,
  };
}
