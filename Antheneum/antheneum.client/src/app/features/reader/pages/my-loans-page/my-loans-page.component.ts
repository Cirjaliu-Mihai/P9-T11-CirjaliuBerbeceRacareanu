import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileFormValue } from '../../../../models/reader/profile-form-value.model';
import { LibraryStore } from '../../../../core/state/library.store';
import { ProfileEditorDialogComponent } from '../../dialogs/profile-editor-dialog/profile-dialog.component';

@Component({
  selector: 'app-my-loans-page',
  templateUrl: './my-loans-page.component.html',
  styleUrl: './my-loans-page.component.css',
  standalone: false,
})
export class MyLoansPageComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: LibraryStore,
    private readonly dialog: MatDialog,
  ) {}

  openProfileDialog() {
    const profile = this.store.currentProfile;
    const draft: ProfileFormValue = {
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      currentPassword: '',
      newPassword: '',
    };

    this.dialog.open(ProfileEditorDialogComponent, {
      width: '720px',
      data: { value: draft },
    }).afterClosed().subscribe((value?: ProfileFormValue) => {
      if (!value) {
        return;
      }
      this.store.updateMyProfile(value).subscribe(() => {
        this.feedbackMessage = 'Profile updated.';
      });
    });
  }
}
