import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { EventsStore } from '../../../../core/state/events.store';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EventDetailDialogComponent } from '../../dialogs/event-detail-dialog/event-detail-dialog.component';

@Component({
  selector: 'app-events-page',
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EventsPageComponent implements OnInit {
  private store = inject(EventsStore);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  events$ = this.store.activeEvents$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;
  totalCount$ = this.store.totalCount$;
  currentPage$ = this.store.currentPage$;
  currentPage = 1;

  get isReader(): boolean {
    return this.auth.role() === 'Reader';
  }

  ngOnInit() {
    this.store.loadActiveEvents(this.currentPage, 10);
  }

  onEventClick(eventId: number) {
    this.dialog
      .open(EventDetailDialogComponent, {
        width: '720px',
        maxWidth: '92vw',
        autoFocus: false,
        data: { eventId },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.enrolled || result?.unenrolled) {
          this.store.loadActiveEvents(this.currentPage, 10);
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.store.loadActiveEvents(page, 10);
  }

  onSignIn() {
    this.router.navigate(['/auth/login']);
  }
}
