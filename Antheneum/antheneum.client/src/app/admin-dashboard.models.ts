export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Book {
  bookId: number;
  isbn: string;
  title: string;
  authors: string | null;
  publisher: string | null;
  imgUrl: string | null;
}

export interface Branch {
  branchId: number;
  uniqueNumber: string;
  name: string;
  address: string | null;
}

export interface Reader {
  readerId: number;
  userId: number;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  libraryCardNumber: string;
  isBlacklisted: boolean;
  role: string;
}

export interface Loan {
  loanId: number;
  copyId: number;
  bookTitle: string;
  isbn: string;
  branchName: string;
  loanDate: string;
  dueDate: string;
  actualReturnDate: string | null;
  isActive: boolean;
  isRenewed: boolean;
}

export interface InventoryReport {
  branchId: number;
  branchName: string;
  bookId: number;
  isbn: string;
  title: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
}

export interface OverdueReport {
  readerId: number;
  username: string;
  email: string;
  libraryCardNumber: string;
  loanId: number;
  branchId: number;
  branchName: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  overdueDays: number;
  loanFineTotal: number;
}

export interface BlacklistReport {
  penaltyId: number;
  readerId: number;
  username: string;
  email: string;
  libraryCardNumber: string;
  loanId: number | null;
  branchId: number | null;
  branchName: string | null;
  reason: string | null;
  penaltyAmount: number;
  isResolved: boolean;
}

export interface TransactionReport {
  loanId: number;
  readerId: number;
  username: string;
  copyId: number;
  branchId: number;
  branchName: string;
  bookId: number;
  isbn: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  actualReturnDate: string | null;
  transactionStatus: string;
}

export type ReportType = 'inventory' | 'overdue' | 'blacklist' | 'transactions';

export type DashboardSection = 'overview' | 'library' | 'readers' | 'returns' | 'reports' | 'loans';

export interface ReturnCandidate {
  loanId: number;
  readerName: string;
  branchName: string;
  bookTitle: string;
  dueDate: string;
  overdueDays: number;
  fineAmount: number;
}