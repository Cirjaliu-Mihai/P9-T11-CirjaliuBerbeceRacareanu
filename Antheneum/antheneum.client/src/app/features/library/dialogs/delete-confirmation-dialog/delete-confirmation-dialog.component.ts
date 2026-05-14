import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type DeleteDialogData = {
  title: string;
  description: string;
  confirmLabel: string;
};

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.css',
  standalone: false,
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public readonly dialogRef: MatDialogRef<DeleteConfirmationDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: DeleteDialogData,
  ) {}
}