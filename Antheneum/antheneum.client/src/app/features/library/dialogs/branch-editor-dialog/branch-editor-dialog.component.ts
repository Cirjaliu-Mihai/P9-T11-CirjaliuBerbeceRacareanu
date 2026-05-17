import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BranchFormValue } from '../../../../models/library/branch-form-value.model';

interface BranchDialogData {
  title: string;
  value: BranchFormValue;
}

@Component({
  selector: 'app-branch-editor-dialog',
  templateUrl: './branch-editor-dialog.component.html',
  styleUrl: './branch-editor-dialog.component.css',
  standalone: false,
})
export class BranchEditorDialogComponent {
  readonly dialogRef =
    inject<MatDialogRef<BranchEditorDialogComponent, BranchFormValue>>(MatDialogRef);
  readonly data = inject<BranchDialogData>(MAT_DIALOG_DATA);
  draft: BranchFormValue = { ...this.data.value };
}
