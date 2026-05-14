import { AuthRole } from './auth-role.model';

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  role: AuthRole;
}
