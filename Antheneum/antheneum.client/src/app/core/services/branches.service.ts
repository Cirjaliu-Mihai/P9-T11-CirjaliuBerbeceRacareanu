import { Injectable } from '@angular/core';
import { Branch } from '../../models/library/branch.model';
import { ApiService } from './api.service';

export interface BranchPayload {
  name: string;
  address: string | null;
}

@Injectable({ providedIn: 'root' })
export class BranchesService {
  constructor(private readonly api: ApiService) {}

  list() {
    return this.api.get<Branch[]>('branches');
  }

  create(payload: BranchPayload) {
    return this.api.post<Branch>('branches', payload);
  }

  update(branchId: number, payload: BranchPayload) {
    return this.api.put<Branch>(`branches/${branchId}`, payload);
  }

  remove(branchId: number) {
    return this.api.delete<void>(`branches/${branchId}`);
  }
}
