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
