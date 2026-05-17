import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventsService } from '../../../../core/services/events.service';
import { EventAttendee } from '../../../../models/events/event.model';
import { PagedResult } from '../../../../models/common/paged-result.model';

@Component({
  selector: 'app-event-attendees-dialog',
  templateUrl: './event-attendees-dialog.component.html',
  styleUrls: ['./event-attendees-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EventAttendeesDialogComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA);
  private eventsService = inject(EventsService);
  private cdr = inject(ChangeDetectorRef);

  eventTitle = this.data.eventTitle;
  attendees: EventAttendee[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  displayedColumns = ['username', 'email', 'libraryCardNumber'];

  ngOnInit() {
    this.loadAttendees();
  }

  loadAttendees() {
    this.loading = true;
    this.cdr.markForCheck();
    this.eventsService
      .getEventAttendees(this.data.eventId, this.currentPage, this.pageSize)
      .subscribe({
        next: (result: PagedResult<EventAttendee>) => {
          this.attendees = result.items;
          this.totalCount = result.totalCount;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.loadAttendees();
  }
}
