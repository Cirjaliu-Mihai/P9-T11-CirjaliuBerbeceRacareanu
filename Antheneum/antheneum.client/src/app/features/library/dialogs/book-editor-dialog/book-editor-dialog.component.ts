import { Component, Inject } from '@angular/core';
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
  draft: BookFormValue;
  selectedFile: File | null = null;

  constructor(
    public readonly dialogRef: MatDialogRef<BookEditorDialogComponent, { value: BookFormValue; file: File | null }>,
    @Inject(MAT_DIALOG_DATA) public readonly data: BookDialogData,
  ) {
    this.draft = { ...data.value };
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
  }
}
