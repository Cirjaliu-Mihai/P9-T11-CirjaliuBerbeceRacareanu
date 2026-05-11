import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookFormValue, BranchFormValue } from './admin-dashboard.store';

type BranchDialogData = {
  title: string;
  value: BranchFormValue;
};

type BookDialogData = {
  title: string;
  value: BookFormValue;
  editing: boolean;
};

type DeleteDialogData = {
  title: string;
  description: string;
  confirmLabel: string;
};

@Component({
  selector: 'app-branch-editor-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <div class="field-grid">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="draft.name" placeholder="Central Atrium" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput [(ngModel)]="draft.address" placeholder="14 Scholar Square" />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button type="button" (click)="dialogRef.close(draft)">Save branch</button>
    </mat-dialog-actions>
  `,
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

@Component({
  selector: 'app-book-editor-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <div class="field-grid field-grid--wide">
        <mat-form-field appearance="outline">
          <mat-label>ISBN</mat-label>
          <input matInput [(ngModel)]="draft.isbn" [disabled]="data.editing" placeholder="978-0143131847" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="draft.title" placeholder="The Library Book" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Authors</mat-label>
          <input matInput [(ngModel)]="draft.authors" placeholder="Susan Orlean" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Publisher</mat-label>
          <input matInput [(ngModel)]="draft.publisher" placeholder="Simon & Schuster" />
        </mat-form-field>
        <div class="file-field">
          <span class="file-field__label">Cover image</span>
          <input type="file" accept="image/*" (change)="onFileSelected($event)" />
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button type="button" (click)="dialogRef.close({ value: draft, file: selectedFile })">Save book</button>
    </mat-dialog-actions>
  `,
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

@Component({
  selector: 'app-delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close(false)">Cancel</button>
      <button mat-stroked-button type="button" color="warn" (click)="dialogRef.close(true)">{{ data.confirmLabel }}</button>
    </mat-dialog-actions>
  `,
  standalone: false,
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public readonly dialogRef: MatDialogRef<DeleteConfirmationDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: DeleteDialogData,
  ) {}
}