import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Event, EventDetail, EventFormValue, EventAttendee } from '../../models/events/event.model';
import { PagedResult } from '../../models/common/paged-result.model';

@Injectable({ providedIn: 'root' })
export class EventsService extends ApiService {
  getActiveEvents(page: number = 1, pageSize: number = 10) {
    return this.get<PagedResult<Event>>(`events?page=${page}&pageSize=${pageSize}`);
  }

  getEventDetail(eventId: number) {
    return this.get<EventDetail>(`events/${eventId}`);
  }

  enrollInEvent(eventId: number) {
    return this.post<{ enrolled: boolean }>(`events/${eventId}/enroll`, {});
  }

  unenrollInEvent(eventId: number) {
    return this.post<{ unenrolled: boolean }>(`events/${eventId}/unenroll`, {});
  }

  getAdminEvents() {
    return this.get<{ upcomingEvents: Event[]; pastEvents: Event[] }>(`events/admin/list`);
  }

  createEvent(formValue: EventFormValue, coverFile: File | null = null) {
    const payload = this.buildEventFormData(formValue, coverFile);
    return this.post<EventDetail>(`events/admin`, payload);
  }

  updateEvent(eventId: number, formValue: EventFormValue, coverFile: File | null = null) {
    const payload = this.buildEventFormData(formValue, coverFile);
    return this.put<EventDetail>(`events/${eventId}`, payload);
  }

  deleteEvent(eventId: number) {
    return this.delete<void>(`events/${eventId}`);
  }

  getEventAttendees(eventId: number, page: number = 1, pageSize: number = 10) {
    return this.get<PagedResult<EventAttendee>>(`events/${eventId}/attendees?page=${page}&pageSize=${pageSize}`);
  }

  private buildEventFormData(formValue: EventFormValue, coverFile: File | null) {
    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('description', formValue.description ?? '');
    formData.append('branchId', formValue.branchId.toString());
    formData.append('startDate', formValue.startDate);
    formData.append('endDate', formValue.endDate);
    formData.append('maxSeats', formValue.maxSeats.toString());

    if (formValue.coverImageUrl) {
      formData.append('coverImageUrl', formValue.coverImageUrl);
    }

    if (coverFile) {
      formData.append('cover', coverFile, coverFile.name);
    }

    return formData;
  }
}
