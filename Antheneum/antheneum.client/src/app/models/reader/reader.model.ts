export interface Reader {
  readerId: number;
  userId: number;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  libraryCardNumber: string;
  isBlacklisted: boolean;
  subscriptionExpiry: string | null;
  hasActiveSubscription: boolean;
  role: string;
}
