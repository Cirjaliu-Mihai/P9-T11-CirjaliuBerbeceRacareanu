import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookFormValue } from '../../../../models/library/book-form-value.model';

interface BookDialogData {
  title: string;
  value: BookFormValue;
  editing: boolean;
}

@Component({
  selector: 'app-book-editor-dialog',
  templateUrl: './book-editor-dialog.component.html',
  styleUrl: './book-editor-dialog.component.css',
  standalone: false,
})
export class BookEditorDialogComponent {
  readonly dialogRef =
    inject<MatDialogRef<BookEditorDialogComponent, { value: BookFormValue; file: File | null }>>(
      MatDialogRef,
    );
  readonly data = inject<BookDialogData>(MAT_DIALOG_DATA);
  draft: BookFormValue = { ...this.data.value };
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
  }
}
