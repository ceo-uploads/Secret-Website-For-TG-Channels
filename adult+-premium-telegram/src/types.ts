export interface User {
  uid: string;
  fullName: string;
  mobileNumber: string;
  password?: string;
  activePackage?: UserPackage;
  transactions?: Transaction[];
  createdAt: string;
}

export interface UserPackage {
  id: string;
  name: string;
  price: number;
  limit: number;
  activationDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export interface Transaction {
  id: string;
  packageId: string;
  packageName: string;
  amount: number;
  method: string;
  accountNumber?: string;
  trxId?: string;
  ntag?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  timestamp: string;
}

export interface Package {
  id: string;
  name: string;
  channels: number;
  priceBDT: number;
  priceUSD?: number;
  durationDays: number; // 1 for 24h, 7 for 1w, 36500 for lifetime
}

export interface TelegramChannel {
  name: string;
  link: string;
}
