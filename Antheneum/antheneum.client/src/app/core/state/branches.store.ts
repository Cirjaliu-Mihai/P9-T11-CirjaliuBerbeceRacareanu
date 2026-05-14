import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Branch } from '../../models/library/branch.model';
import { BranchFormValue } from '../../models/library/branch-form-value.model';
import { BranchesService } from '../services/branches.service';

@Injectable({ providedIn: 'root' })
export class BranchesStore {
  private nextTemporaryId = -1;
  private readonly branchesSubject = new BehaviorSubject<Branch[]>([]);

  readonly branches$ = this.branchesSubject.asObservable();

  constructor(private readonly branchesService: BranchesService) {}

  get branches(): Branch[] {
    return this.branchesSubject.value;
  }

  set branches(value: Branch[]) {
    this.branchesSubject.next(value);
  }

  getBranchName(selectedBranchId: string): string {
    const branchId = Number(selectedBranchId);
    if (!branchId) {
      return 'All branches';
    }
    return this.branches.find((branch) => branch.branchId === branchId)?.name ?? 'Selected branch';
  }

  createBranch(value: BranchFormValue): Observable<Branch> {
    const payload = { name: value.name.trim(), address: value.address.trim() || null };
    const temporaryBranch: Branch = { branchId: this.consumeTemporaryId(), uniqueNumber: 'Pending', ...payload };
    this.branches = [temporaryBranch, ...this.branches];

    return this.branchesService.create(payload).pipe(
      tap((branch) => {
        this.branches = this.branches.map((item) => item.branchId === temporaryBranch.branchId ? branch : item);
      }),
      catchError((error) => {
        this.branches = this.branches.filter((item) => item.branchId !== temporaryBranch.branchId);
        return throwError(() => error);
      }),
    );
  }

  updateBranch(branchId: number, value: BranchFormValue): Observable<Branch> {
    const previousBranches = this.branches;
    const currentBranch = this.branches.find((item) => item.branchId === branchId);
    const payload = { name: value.name.trim(), address: value.address.trim() || null };

    if (currentBranch) {
      const optimisticBranch: Branch = { ...currentBranch, ...payload };
      this.branches = this.branches.map((item) => item.branchId === branchId ? optimisticBranch : item);
    }

    return this.branchesService.update(branchId, payload).pipe(
      tap((branch) => {
        this.branches = this.branches.map((item) => item.branchId === branchId ? branch : item);
      }),
      catchError((error) => {
        this.branches = previousBranches;
        return throwError(() => error);
      }),
    );
  }

  deleteBranch(branchId: number): Observable<void> {
    const previousBranches = this.branches;
    this.branches = this.branches.filter((item) => item.branchId !== branchId);

    return this.branchesService.remove(branchId).pipe(
      catchError((error) => {
        this.branches = previousBranches;
        return throwError(() => error);
      }),
    );
  }

  reset(): void {
    this.branches = [];
  }

  private consumeTemporaryId() {
    return this.nextTemporaryId--;
  }
}
