import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BlacklistService {
  constructor(private readonly api: ApiService) {}

  resolve(penaltyId: number) {
    return this.api.put<void>(`blacklist/${penaltyId}/resolve`, {});
  }
}
