import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Branch } from '../../../../models/library/branch.model';
import { BranchFormValue } from '../../../../models/library/branch-form-value.model';
import { LibraryStore } from '../../../../core/state/library.store';
import { BranchEditorDialogComponent } from '../../dialogs/branch-editor-dialog/branch-editor-dialog.component';
import { DeleteConfirmationDialogComponent } from '../../dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-branch-view',
  templateUrl: './branch-view.component.html',
  styleUrl: './branch-view.component.css',
  standalone: false,
})
export class BranchViewComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: LibraryStore,
    private readonly dialog: MatDialog,
  ) {}

  openCreateBranchDialog() {
    this.dialog.open(BranchEditorDialogComponent, {
      width: '560px',
      data: { title: 'Create branch', value: { name: '', address: '' } },
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
