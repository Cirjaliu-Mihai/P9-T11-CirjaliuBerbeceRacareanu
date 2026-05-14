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
