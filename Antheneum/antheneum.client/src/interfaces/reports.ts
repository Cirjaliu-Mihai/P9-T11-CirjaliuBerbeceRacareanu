export interface InventoryReportDto {
  branchId: number;
  branchName: string;
  bookId: number;
  isbn: string;
  title: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
}

export interface OverdueReportDto {
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

export interface BlacklistReportDto {
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

export interface TransactionReportDto {
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
