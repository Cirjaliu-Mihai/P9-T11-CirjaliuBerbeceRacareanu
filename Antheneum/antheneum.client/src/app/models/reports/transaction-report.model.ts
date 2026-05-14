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
