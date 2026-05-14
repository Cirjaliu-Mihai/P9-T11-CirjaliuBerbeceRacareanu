import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Branch } from './admin-dashboard.models';
import { AdminDashboardStore, BranchFormValue } from './admin-dashboard.store';
import {
  BranchEditorDialogComponent,
  DeleteConfirmationDialogComponent,
} from './library-dialogs.component';

@Component({
  selector: 'app-branch-view',
  template: `
    <mat-card class="panel">
      <div class="panel-heading">
        <div>
          <p class="kicker">Branches</p>
          <h3>Branch management</h3>
        </div>
        <div class="toolbar-actions">
          <mat-chip-set>
            <mat-chip>{{ store.branches.length }} branches</mat-chip>
          </mat-chip-set>
          <button mat-flat-button type="button" (click)="openCreateBranchDialog()">New branch</button>
        </div>
      </div>

      <div class="stack-list">
        <mat-card *ngFor="let branch of store.branches" class="stack-card">
          <div>
            <strong>{{ branch.name }}</strong>
            <p>{{ branch.address || 'Address pending' }}</p>
          </div>
          <div class="card-actions">
            <span>{{ branch.uniqueNumber }}</span>
            <div class="action-row">
              <button mat-stroked-button type="button" (click)="openEditBranchDialog(branch)">Edit</button>
              <button mat-stroked-button type="button" color="warn" (click)="confirmDelete(branch)">Delete</button>
            </div>
          </div>
        </mat-card>
      </div>
    </mat-card>

    <mat-card *ngIf="feedbackMessage" class="panel feedback-panel">
      <p class="kicker">Branch workflow</p>
      <p>{{ feedbackMessage }}</p>
    </mat-card>
  `,
  standalone: false,
})
export class BranchViewComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: AdminDashboardStore,
    private readonly dialog: MatDialog,
  ) {}

  openCreateBranchDialog() {
    this.dialog.open(BranchEditorDialogComponent, {
      width: '560px',
      data: {
        title: 'Create branch',
        value: { name: '', address: '' },
      },
    }).afterClosed().subscribe((value?: BranchFormValue) => {
      if (!value) {
        return;
      }

      this.store.createBranch(value).subscribe(() => {
        this.feedbackMessage = 'Branch created.';
      });
    });
  }

  openEditBranchDialog(branch: Branch) {
    this.dialog.open(BranchEditorDialogComponent, {
      width: '560px',
      data: {
        title: 'Edit branch',
        value: { name: branch.name, address: branch.address ?? '' },
      },
    }).afterClosed().subscribe((value?: BranchFormValue) => {
      if (!value) {
        return;
      }

      this.store.updateBranch(branch.branchId, value).subscribe(() => {
        this.feedbackMessage = 'Branch updated.';
      });
    });
  }

  confirmDelete(branch: Branch) {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '440px',
      data: {
        title: `Remove ${branch.name}`,
        description: 'This action updates the current API state immediately.',
        confirmLabel: 'Delete',
      },
    }).afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) {
        return;
      }

      this.store.deleteBranch(branch.branchId).subscribe(() => {
        this.feedbackMessage = 'Branch deleted.';
      });
    });
  }
}