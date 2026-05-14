import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Branch } from '../../../../models/library/branch.model';

interface AddCopiesDialogData {
  branches: Branch[];
}

interface AddCopiesResult {
  branchId: number;
  count: number;
}

@Component({
  selector: 'app-add-copies-dialog',
  templateUrl: './add-copies-dialog.component.html',
  standalone: false,
})
export class AddCopiesDialogComponent {
  readonly dialogRef =
    inject<MatDialogRef<AddCopiesDialogComponent, AddCopiesResult>>(MatDialogRef);
  readonly data = inject<AddCopiesDialogData>(MAT_DIALOG_DATA);

  branchId = 0;
  count = 1;

  submit() {
    if (!this.branchId || this.count < 1) {
      return;
    }
    this.dialogRef.close({ branchId: this.branchId, count: this.count });
  }
}
