import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { Branch } from '../../../../models/library/branch.model';
import { BranchFormValue } from '../../../../models/library/branch-form-value.model';
import { BranchesStore } from '../../../../core/state/branches.store';
import { BranchEditorDialogComponent } from '../../dialogs/branch-editor-dialog/branch-editor-dialog.component';
import { DeleteConfirmationDialogComponent } from '../../dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-branch-view',
  templateUrl: './branch-view.component.html',
  styleUrl: './branch-view.component.css',
  standalone: false,
})
export class BranchViewComponent implements OnDestroy {
  readonly store = inject(BranchesStore);

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCreateBranchDialog() {
    this.dialog
      .open(BranchEditorDialogComponent, {
        width: '560px',
        data: { title: 'Create branch', value: { name: '', address: '' } },
      })
      .afterClosed()
      .pipe(
        switchMap((value?: BranchFormValue) => {
          if (!value) {
            return of(null);
          }
          return this.store.createBranch(value);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to create branch.', 'Dismiss', { duration: 4000 }),
      });
  }

  openEditBranchDialog(branch: Branch) {
    this.dialog
      .open(BranchEditorDialogComponent, {
        width: '560px',
        data: {
          title: 'Edit branch',
          value: { name: branch.name, address: branch.address ?? '' },
        },
      })
      .afterClosed()
      .pipe(
        switchMap((value?: BranchFormValue) => {
          if (!value) {
            return of(null);
          }
          return this.store.updateBranch(branch.branchId, value);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to update branch.', 'Dismiss', { duration: 4000 }),
      });
  }

  confirmDelete(branch: Branch) {
    this.dialog
      .open(DeleteConfirmationDialogComponent, {
        width: '440px',
        data: {
          title: `Remove ${branch.name}`,
          confirmLabel: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        switchMap((confirmed?: boolean) => {
          if (!confirmed) {
            return of(null);
          }
          return this.store.deleteBranch(branch.branchId);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to delete branch.', 'Dismiss', { duration: 4000 }),
      });
  }
}
