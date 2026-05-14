import { Component, Inject } from '@angular/core';
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
  draft: BranchFormValue;

  constructor(
    public readonly dialogRef: MatDialogRef<BranchEditorDialogComponent, BranchFormValue>,
    @Inject(MAT_DIALOG_DATA) public readonly data: BranchDialogData,
  ) {
    this.draft = { ...data.value };
  }
}
