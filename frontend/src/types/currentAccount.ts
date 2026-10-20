export interface CurrentCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyInfo {
  companyName?: string;
  city?: string;
  district?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
}

export interface ContactCard {
  _id?: string;
  fullName: string;
  phone: string;
  duty?: string;
  description?: string;
  createdAt?: string;
}

export interface CurrentAccount {
  _id: string;
  code: number;
  title: string;
  categoryId: CurrentCategory | any;
  notes?: string;
  company?: CompanyInfo;
  contacts?: ContactCard[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCurrentAccountPayload {
  title: string;
  categoryId: string;
  notes?: string;
}
