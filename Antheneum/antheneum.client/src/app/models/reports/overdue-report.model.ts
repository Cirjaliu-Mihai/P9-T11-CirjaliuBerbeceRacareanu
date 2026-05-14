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
