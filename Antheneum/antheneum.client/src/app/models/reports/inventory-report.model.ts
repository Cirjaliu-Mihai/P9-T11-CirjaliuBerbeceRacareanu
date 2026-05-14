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
