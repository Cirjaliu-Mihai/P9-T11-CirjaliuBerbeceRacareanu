import { Component, Inject } from '@angular/core';
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
  branchId = 0;
  count = 1;

  constructor(
    public readonly dialogRef: MatDialogRef<AddCopiesDialogComponent, AddCopiesResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: AddCopiesDialogData,
  ) {}

  submit() {
    if (!this.branchId || this.count < 1) {
      return;
    }
    this.dialogRef.close({ branchId: this.branchId, count: this.count });
  }
}
