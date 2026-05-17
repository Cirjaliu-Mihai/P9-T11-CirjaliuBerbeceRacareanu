export interface BookAvailability {
  copyId: number;
  branchName: string;
  status: string;
  borrowerName: string | null;
}
