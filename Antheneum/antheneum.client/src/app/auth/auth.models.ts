export type AuthRole = 'Administrator' | 'Reader';

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  role: AuthRole;
}

export interface AuthSession extends AuthResponseDto {}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
}