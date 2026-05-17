import { Component, Inject, inject } from '@angular/core';
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
  readonly dialogRef =
    inject<MatDialogRef<ProfileEditorDialogComponent, ProfileFormValue>>(MatDialogRef);
  readonly data = inject<ProfileDialogData>(MAT_DIALOG_DATA);
  draft: ProfileFormValue = { ...this.data.value };
}
