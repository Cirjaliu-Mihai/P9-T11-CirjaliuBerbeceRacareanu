import { Component, OnDestroy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookFormValue } from '../../../../models/library/book-form-value.model';

interface BookDialogData {
  title: string;
  value: BookFormValue;
  editing: boolean;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-book-editor-dialog',
  templateUrl: './book-editor-dialog.component.html',
  styleUrl: './book-editor-dialog.component.css',
  standalone: false,
})
export class BookEditorDialogComponent implements OnDestroy {
  readonly dialogRef =
    inject<MatDialogRef<BookEditorDialogComponent, { value: BookFormValue; file: File | null }>>(
      MatDialogRef,
    );
  readonly data = inject<BookDialogData>(MAT_DIALOG_DATA);
  draft: BookFormValue = { ...this.data.value };
  selectedFile: File | null = null;
  selectedFilePreviewUrl: string | null = null;

  get displayedImageUrl(): string | null {
    return this.selectedFilePreviewUrl ?? this.data.imageUrl ?? null;
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
      this.selectedFilePreviewUrl = null;
    }
    this.selectedFile = target.files?.[0] ?? null;
    if (this.selectedFile) {
      this.selectedFilePreviewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  ngOnDestroy() {
    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
    }
  }
}
