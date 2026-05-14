import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BlacklistService {
  constructor(private readonly api: ApiService) {}

  resolve(readerId: number) {
    return this.api.delete<void>(`blacklist/${readerId}`);
  }
}
