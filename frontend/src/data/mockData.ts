export interface Contact {
  id: string;
  name: string;
  initials: string;
  bank: string;
  account: string;
  upi: string;
  colorIdx: number;
}

export interface Transaction {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  daysAgo: number;
  bgColor: string;
}

export interface UpcomingPayment {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  dueInDays: number;
  bgColor: string;
}

export interface FDRate {
  tenureDays: number;
  label: string;
  shortLabel: string;
  rate: number;
  isBest?: boolean;
}

export const mockUser = {
  name: 'Ananya Krishnan',
  initials: 'AK',
  greeting: 'Good morning',
  accountNumber: '****4521',
  balance: 245890,
  savings: 12300,
  monthlySpend: 38450,
};

export const mockContacts: Contact[] = [
  { id: '1', name: 'Priya Sharma',    initials: 'PS', bank: 'HDFC',  account: '****3421', upi: 'priya.sharma@hdfc',    colorIdx: 0 },
  { id: '2', name: 'Priya Mehta',     initials: 'PM', bank: 'ICICI', account: '****7823', upi: 'priya.m@icici',        colorIdx: 4 },
  { id: '3', name: 'Ravi Kumar',      initials: 'RK', bank: 'SBI',   account: '****5612', upi: 'ravikumar@sbi',        colorIdx: 1 },
  { id: '4', name: 'Suresh Patel',    initials: 'SP', bank: 'Axis',  account: '****9034', upi: 'suresh.patel@axisbank',colorIdx: 3 },
  { id: '5', name: 'Meera Nair',      initials: 'MN', bank: 'Kotak', account: '****1267', upi: 'meeranair@kotak',      colorIdx: 2 },
  { id: '6', name: 'Amit Shah',       initials: 'AS', bank: 'HDFC',  account: '****4521', upi: 'amitshah@hdfc',        colorIdx: 5 },
  { id: '7', name: 'Deepa Verma',     initials: 'DV', bank: 'ICICI', account: '****2390', upi: 'deepaverma@icici',     colorIdx: 4 },
  { id: '8', name: 'Kiran Reddy',     initials: 'KR', bank: 'SBI',   account: '****8811', upi: 'kiranreddy@sbi',       colorIdx: 1 },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', name: 'Zomato',          emoji: '🍔', amount: 450,    type: 'debit',  date: '8 Jun',  daysAgo: 2,  bgColor: '#FF6B3020' },
  { id: 't2', name: 'BESCOM Electricity', emoji: '⚡', amount: 2340, type: 'debit',  date: '5 Jun',  daysAgo: 5,  bgColor: '#FFB02020' },
  { id: 't3', name: 'Salary Credit',   emoji: '💼', amount: 95000, type: 'credit', date: '2 Jun',  daysAgo: 8,  bgColor: '#00C89620' },
  { id: 't4', name: 'Amazon',          emoji: '📦', amount: 1899,  type: 'debit',  date: '31 May', daysAgo: 10, bgColor: '#FF8C0020' },
  { id: 't5', name: 'Priya Sharma',    emoji: '👤', amount: 5000,  type: 'debit',  date: '29 May', daysAgo: 12, bgColor: '#6C63FF20' },
  { id: 't6', name: 'Netflix',         emoji: '🎬', amount: 649,   type: 'debit',  date: '28 May', daysAgo: 13, bgColor: '#FF5C6A20' },
];

export const mockUpcoming: UpcomingPayment[] = [
  { id: 'u1', name: 'Netflix',           emoji: '🎬', amount: 649,   dueInDays: 3,  bgColor: '#FF5C6A20' },
  { id: 'u2', name: 'Gym Membership',    emoji: '💪', amount: 1500,  dueInDays: 5,  bgColor: '#6C63FF20' },
  { id: 'u3', name: 'Car Loan EMI',      emoji: '🚗', amount: 12450, dueInDays: 8,  bgColor: '#00C89620' },
  { id: 'u4', name: 'Internet Bill',     emoji: '📡', amount: 999,   dueInDays: 12, bgColor: '#FFB02020' },
];

export const fdRates: FDRate[] = [
  { tenureDays: 7,    label: '7 Days',   shortLabel: '7d',  rate: 3.50 },
  { tenureDays: 30,   label: '1 Month',  shortLabel: '1m',  rate: 4.00 },
  { tenureDays: 90,   label: '3 Months', shortLabel: '3m',  rate: 5.50 },
  { tenureDays: 180,  label: '6 Months', shortLabel: '6m',  rate: 6.00 },
  { tenureDays: 365,  label: '1 Year',   shortLabel: '1y',  rate: 7.10 },
  { tenureDays: 730,  label: '2 Years',  shortLabel: '2y',  rate: 7.25 },
  { tenureDays: 1095, label: '3 Years',  shortLabel: '3y',  rate: 7.50, isBest: true },
];

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calcMaturity(principal: number, rate: number, days: number): number {
  return Math.round(principal * (1 + (rate / 100) * (days / 365)));
}

export function searchContacts(query: string): Contact[] {
  const q = query.toLowerCase().trim();
  if (!q) return mockContacts.slice(0, 5);
  return mockContacts.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.upi.toLowerCase().includes(q) ||
    c.bank.toLowerCase().includes(q)
  );
}
