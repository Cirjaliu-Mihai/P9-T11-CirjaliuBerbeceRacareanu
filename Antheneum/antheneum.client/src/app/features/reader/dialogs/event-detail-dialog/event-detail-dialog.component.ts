import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventsStore } from '../../../../core/state/events.store';
import { EventsService } from '../../../../core/services/events.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EventDetailDialogComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA);
  private store = inject(EventsStore);
  private eventsService = inject(EventsService);
  private auth = inject(AuthService);
  dialogRef = inject(MatDialogRef);
  private snackBar = inject(MatSnackBar);

  event$ = this.store.currentEvent$;
  loading$ = this.store.loading$;
  enrolling = false;
  unenrolling = false;

  get isReader(): boolean {
    return this.auth.role() === 'Reader';
  }

  ngOnInit() {
    this.store.loadEventDetail(this.data.eventId);
  }

  onEnroll() {
    if (this.enrolling) {
      return;
    }

    this.enrolling = true;
    this.eventsService.enrollInEvent(this.data.eventId).subscribe({
      next: () => {
        this.snackBar.open('Successfully enrolled in event!', 'Close', { duration: 3000 });
        this.store.loadEventDetail(this.data.eventId);
        this.enrolling = false;
        this.dialogRef.close({ enrolled: true });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.error || 'Failed to enroll',
          'Close',
          { duration: 3000 }
        );
        this.enrolling = false;
      },
    });
  }

  onUnenroll() {
    if (this.unenrolling) {
      return;
    }

    this.unenrolling = true;
    this.eventsService.unenrollInEvent(this.data.eventId).subscribe({
      next: () => {
        this.snackBar.open('You have un-enrolled from this event.', 'Close', { duration: 3000 });
        this.store.loadEventDetail(this.data.eventId);
        this.unenrolling = false;
        this.dialogRef.close({ unenrolled: true });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.error || 'Failed to un-enroll',
          'Close',
          { duration: 3000 }
        );
        this.unenrolling = false;
      },
    });
  }

  onSignIn() {
    this.dialogRef.close();
  }
}
