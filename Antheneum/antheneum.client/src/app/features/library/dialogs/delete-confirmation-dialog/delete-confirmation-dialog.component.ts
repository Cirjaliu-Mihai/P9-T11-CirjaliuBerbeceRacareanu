import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type DeleteDialogData = {
  title: string;
  confirmLabel: string;
};

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.css',
  standalone: false,
})
export class DeleteConfirmationDialogComponent {
  readonly dialogRef =
    inject<MatDialogRef<DeleteConfirmationDialogComponent, boolean>>(MatDialogRef);
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);
}
