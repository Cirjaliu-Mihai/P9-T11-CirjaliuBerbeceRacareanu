export interface ReaderPenalty {
  penaltyId: number;
  bookTitle: string;
  branchName: string;
  reason: string | null;
  amount: number;
}
