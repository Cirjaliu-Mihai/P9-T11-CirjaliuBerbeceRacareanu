export interface ActiveLoanSummary {
  loanId: number;
  readerName: string;
  bookTitle: string;
  branchName: string;
  dueDate: string;
  overdueDays: number;
  fineAmount: number;
}
