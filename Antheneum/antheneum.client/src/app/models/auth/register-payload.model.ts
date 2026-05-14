export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
}
