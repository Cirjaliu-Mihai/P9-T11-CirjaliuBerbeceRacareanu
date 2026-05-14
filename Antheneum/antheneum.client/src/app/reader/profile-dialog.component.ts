import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfileFormValue } from '../admin/admin-dashboard.store';

type ProfileDialogData = {
  value: ProfileFormValue;
};

@Component({
  selector: 'app-profile-editor-dialog',
  template: `
    <h2 mat-dialog-title>Edit reader profile</h2>
    <mat-dialog-content>
      <div class="field-grid field-grid--wide">
        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput [(ngModel)]="draft.phone" placeholder="555-0113" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput [(ngModel)]="draft.address" placeholder="7 Finch Yard" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Current password</mat-label>
          <input matInput type="password" [(ngModel)]="draft.currentPassword" placeholder="Current password" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>New password</mat-label>
          <input matInput type="password" [(ngModel)]="draft.newPassword" placeholder="Leave blank to keep password" />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button type="button" (click)="dialogRef.close(draft)">Save profile</button>
    </mat-dialog-actions>
  `,
  standalone: false,
})
export class ProfileEditorDialogComponent {
  draft: ProfileFormValue;

  constructor(
    public readonly dialogRef: MatDialogRef<ProfileEditorDialogComponent, ProfileFormValue>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProfileDialogData,
  ) {
    this.draft = { ...data.value };
  }
}