import { Injectable } from '@angular/core';
import { BlacklistReport } from '../../models/reports/blacklist-report.model';
import { InventoryReport } from '../../models/reports/inventory-report.model';
import { OverdueReport } from '../../models/reports/overdue-report.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { TransactionReport } from '../../models/reports/transaction-report.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly api: ApiService) {}

  inventory(branchId: number | null, page = 1, pageSize = 8) {
    return this.api.get<PagedResult<InventoryReport>>(
      `reports/inventory${this.paged(branchId, page, pageSize)}`,
    );
  }

  overdue(branchId: number | null, page = 1, pageSize = 8) {
    return this.api.get<PagedResult<OverdueReport>>(
      `reports/overdue${this.paged(branchId, page, pageSize)}`,
    );
  }

  blacklist(branchId: number | null, page = 1, pageSize = 8) {
    return this.api.get<PagedResult<BlacklistReport>>(
      `reports/blacklist${this.paged(branchId, page, pageSize)}`,
    );
  }

  transactions(from: string, to: string, branchId: number | null, page = 1, pageSize = 8) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    if (branchId !== null) {
      params.set('branchId', branchId.toString());
    }
    return this.api.get<PagedResult<TransactionReport>>(`reports/transactions?${params.toString()}`);
  }

  private paged(branchId: number | null, page: number, pageSize: number) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    if (branchId !== null) {
      params.set('branchId', branchId.toString());
    }
    return `?${params.toString()}`;
  }
}
