import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminDashboardStore, ProfileFormValue } from './admin-dashboard.store';
import { ProfileEditorDialogComponent } from './profile-dialog.component';

@Component({
  selector: 'app-my-loans-page',
  template: `
    <section class="page-grid page-grid--two">
      <mat-card class="panel">
        <div class="panel-heading">
          <div>
            <p class="kicker">Reader dashboard</p>
            <h3>My active loans</h3>
          </div>
          <mat-chip-set>
            <mat-chip>{{ store.myLoans.length }} current items</mat-chip>
          </mat-chip-set>
        </div>

        <div class="loan-grid">
          <mat-card *ngFor="let loan of store.myLoans" class="loan-card">
            <p>{{ loan.branchName }}</p>
            <strong>{{ loan.bookTitle }}</strong>
            <span>{{ loan.isbn }}</span>
            <dl>
              <div>
                <dt>Borrowed</dt>
                <dd>{{ loan.loanDate }}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{{ loan.dueDate }}</dd>
              </div>
              <div>
                <dt>Renewal</dt>
                <dd>{{ loan.isRenewed ? 'Already renewed' : 'Eligible' }}</dd>
              </div>
            </dl>
          </mat-card>
        </div>
      </mat-card>

      <mat-card class="panel">
        <div class="panel-heading">
          <div>
            <p class="kicker">Reader profile</p>
            <h3>Profile editing workflow</h3>
          </div>
          <button mat-flat-button type="button" (click)="openProfileDialog()">Edit profile</button>
        </div>

        <div *ngIf="store.currentProfile; else noProfile" class="profile-card">
          <strong>{{ store.currentProfile.username }}</strong>
          <p>{{ store.currentProfile.email }}</p>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>{{ store.currentProfile.phone || 'Not set' }}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{{ store.currentProfile.address || 'Not set' }}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{{ store.currentProfile.role }}</dd>
            </div>
          </dl>
        </div>

        <ng-template #noProfile>
          <mat-card class="empty-state">
            <strong>No profile loaded</strong>
            <p>The reader profile view will populate when authenticated reader data is available.</p>
          </mat-card>
        </ng-template>

        <p *ngIf="feedbackMessage" class="inline-feedback">{{ feedbackMessage }}</p>
      </mat-card>
    </section>
  `,
  standalone: false,
})
export class MyLoansPageComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: AdminDashboardStore,
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
