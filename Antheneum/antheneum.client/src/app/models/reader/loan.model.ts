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
