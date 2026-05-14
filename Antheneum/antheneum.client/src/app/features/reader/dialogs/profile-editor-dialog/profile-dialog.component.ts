import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfileFormValue } from '../../../../models/reader/profile-form-value.model';

interface ProfileDialogData {
  value: ProfileFormValue;
}

@Component({
  selector: 'app-profile-editor-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.css',
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
