import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Event, EventDetail } from '../../models/events/event.model';
import { EventsService } from '../services/events.service';
import { PagedResult } from '../../models/common/paged-result.model';

@Injectable({ providedIn: 'root' })
export class EventsStore {
  private activeEvents = new BehaviorSubject<Event[]>([]);
  private currentEvent = new BehaviorSubject<EventDetail | null>(null);
  private loading = new BehaviorSubject(false);
  private error = new BehaviorSubject<string | null>(null);
  private totalCount = new BehaviorSubject(0);
  private currentPage = new BehaviorSubject(1);

  activeEvents$ = this.activeEvents.asObservable();
  currentEvent$ = this.currentEvent.asObservable();
  loading$ = this.loading.asObservable();
  error$ = this.error.asObservable();
  totalCount$ = this.totalCount.asObservable();
  currentPage$ = this.currentPage.asObservable();

  constructor(private eventsService: EventsService) {}

  loadActiveEvents(page: number = 1, pageSize: number = 10) {
    this.loading.next(true);
    this.error.next(null);
    this.currentPage.next(page);

    this.eventsService.getActiveEvents(page, pageSize).subscribe({
      next: (result: PagedResult<Event>) => {
        this.activeEvents.next(result.items);
        this.totalCount.next(result.totalCount);
        this.loading.next(false);
      },
      error: (err: any) => {
        this.error.next(err?.error?.message || 'Failed to load events');
        this.loading.next(false);
      },
    });
  }

  loadEventDetail(eventId: number) {
    this.loading.next(true);
    this.error.next(null);

    this.eventsService.getEventDetail(eventId).subscribe({
      next: (event: EventDetail) => {
        this.currentEvent.next(event);
        this.loading.next(false);
      },
      error: (err: any) => {
        this.error.next(err?.error?.message || 'Failed to load event');
        this.loading.next(false);
      },
    });
  }

  enrollInEvent(eventId: number) {
    this.loading.next(true);

    return this.eventsService.enrollInEvent(eventId);
  }
}
