import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventsService } from '../../../../core/services/events.service';
import { EventsStore } from '../../../../core/state/events.store';
import { Event, EventDetail } from '../../../../models/events/event.model';
import { EventEditorDialogComponent } from '../../dialogs/event-editor-dialog/event-editor-dialog.component';
import { EventAttendeesDialogComponent } from '../../dialogs/event-attendees-dialog/event-attendees-dialog.component';

@Component({
  selector: 'app-events-view',
  templateUrl: './events-view.component.html',
  styleUrls: ['./events-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EventsViewComponent {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private eventsService = inject(EventsService);
  private store = inject(EventsStore);
  private cdr = inject(ChangeDetectorRef);

  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  selectedTab = 0;

  private readonly editorDialogConfig = {
    width: '960px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    autoFocus: false,
  };

  ngOnInit() {
    this.loadAdminEvents();
  }

  loadAdminEvents() {
    this.eventsService.getAdminEvents().subscribe({
      next: (result) => {
        // Create new array references to trigger change detection with OnPush strategy
        this.upcomingEvents = [...result.upcomingEvents];
        this.pastEvents = [...result.pastEvents];
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to load events',
          'Close',
          { duration: 3000 }
        );
        this.cdr.markForCheck();
      },
    });
  }

  onCreateEvent() {
    this.dialog.open(EventEditorDialogComponent, this.editorDialogConfig).afterClosed().subscribe((result) => {
      if (result) {
        this.loadAdminEvents();
      }
    });
  }

  onEditEvent(event: Event) {
    this.eventsService.getEventDetail(event.eventId).subscribe({
      next: (eventDetail: EventDetail) => {
        this.dialog
          .open(EventEditorDialogComponent, { ...this.editorDialogConfig, data: eventDetail })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.loadAdminEvents();
            }
          });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to load event details',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  onDeleteEvent(event: Event) {
    if (!confirm(`Delete event "${event.title}"?`)) return;

    this.eventsService.deleteEvent(event.eventId).subscribe({
      next: () => {
        this.snackBar.open('Event deleted', 'Close', { duration: 2000 });
        this.loadAdminEvents();
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to delete event',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  onViewAttendees(event: Event) {
    this.dialog.open(EventAttendeesDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      maxHeight: '88vh',
      autoFocus: false,
      data: { eventId: event.eventId, eventTitle: event.title },
    });
  }

  canEditDelete(event: Event): boolean {
    const now = new Date();
    const eventEnd = new Date(event.endDate);
    return eventEnd > now;
  }
}
