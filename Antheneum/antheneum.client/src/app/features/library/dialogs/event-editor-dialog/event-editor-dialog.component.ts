import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventsService } from '../../../../core/services/events.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { EventDetail, EventFormValue } from '../../../../models/events/event.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-event-editor-dialog',
  templateUrl: './event-editor-dialog.component.html',
  styleUrls: ['./event-editor-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EventEditorDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA) as EventDetail | undefined;
  dialogRef = inject(MatDialogRef);
  private fb = inject(FormBuilder);
  private eventsService = inject(EventsService);
  private branchesService = inject(BranchesService);
  private snackBar = inject(MatSnackBar);
  private destroy = new Subject<void>();

  form!: FormGroup;
  branches: any[] = [];
  submitting = false;
  minStartDate = this.getTodayStart();
  selectedFile: File | null = null;
  selectedFilePreviewUrl: string | null = null;
  displayedImageUrl: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadBranches();
  }

  private initForm() {
    const now = new Date();
    const defaultStartTime = this.toTimeString(now);
    const defaultEndTime = this.toTimeString(new Date(now.getTime() + 60 * 60 * 1000));

    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      branchId: [0, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      startTime: [defaultStartTime, Validators.required],
      endDate: ['', Validators.required],
      endTime: [defaultEndTime, Validators.required],
      maxSeats: [0, [Validators.required, Validators.min(1)]],
    }, { validators: this.eventDateValidator() });

    if (this.data) {
      this.displayedImageUrl = this.data.coverImageUrl;
      this.form.patchValue({
        title: this.data.title,
        description: this.data.description,
        branchId: this.data.branchId,
        startDate: this.toDatePickerValue(this.data.startDate),
        startTime: this.toTimeString(new Date(this.data.startDate)),
        endDate: this.toDatePickerValue(this.data.endDate),
        endTime: this.toTimeString(new Date(this.data.endDate)),
        maxSeats: this.data.maxSeats,
      });
    }
  }

  private toDatePickerValue(value: string) {
    return value ? new Date(value) : null;
  }

  private formatDateForApi(value: Date, time: string) {
    const [hours, minutes] = (time || '00:00').split(':').map((part) => Number(part));
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hh = String(Number.isFinite(hours) ? hours : 0).padStart(2, '0');
    const mm = String(Number.isFinite(minutes) ? minutes : 0).padStart(2, '0');
    return `${year}-${month}-${day}T${hh}:${mm}:00`;
  }

  private getTodayStart(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private toTimeString(value: Date): string {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private combineDateAndTime(dateValue: Date, timeValue: string): Date {
    const [h, m] = (timeValue || '00:00').split(':').map((part) => Number(part));
    return new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
      Number.isFinite(h) ? h : 0,
      Number.isFinite(m) ? m : 0,
      0,
      0,
    );
  }

  get minEndDate(): Date | null {
    return (this.form?.get('startDate')?.value as Date | null) ?? null;
  }

  private eventDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('startDate')?.value as Date | null;
      const startTime = control.get('startTime')?.value as string | null;
      const end = control.get('endDate')?.value as Date | null;
      const endTime = control.get('endTime')?.value as string | null;

      if (!start || !startTime || !end || !endTime) {
        return null;
      }

      const startDateTime = this.combineDateAndTime(start, startTime);
      const endDateTime = this.combineDateAndTime(end, endTime);

      if (!this.data && startDateTime < new Date()) {
        return { startDateInPast: true };
      }

      return endDateTime < startDateTime ? { dateRangeInvalid: true } : null;
    };
  }

  private loadBranches() {
    this.branchesService
      .list()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (branches: any[]) => {
          this.branches = branches;
        },
        error: (err: any) => {
          this.snackBar.open('Failed to load branches', 'Close', { duration: 3000 });
        },
      });
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;

    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
      this.selectedFilePreviewUrl = null;
    }

    this.selectedFile = file;
    if (this.selectedFile) {
      this.selectedFilePreviewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  get displayImageUrl(): string | null {
    // Priority: newly selected file preview, then existing image
    return this.selectedFilePreviewUrl || this.displayedImageUrl;
  }

  onSubmit() {
    if (!this.form.valid) return;

    const startDateValue = this.form.get('startDate')!.value as Date;
    const startTimeValue = this.form.get('startTime')!.value as string;
    const endDateValue = this.form.get('endDate')!.value as Date;
    const endTimeValue = this.form.get('endTime')!.value as string;

    if (!startDateValue || !startTimeValue || !endDateValue || !endTimeValue) {
      this.snackBar.open('Please select both date and time for start/end', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formValue: EventFormValue = {
      eventId: this.data?.eventId || null,
      title: this.form.get('title')!.value,
      description: this.form.get('description')!.value || null,
      branchId: this.form.get('branchId')!.value,
      startDate: this.formatDateForApi(startDateValue, startTimeValue),
      endDate: this.formatDateForApi(endDateValue, endTimeValue),
      maxSeats: this.form.get('maxSeats')!.value,
      coverImageUrl: this.data?.coverImageUrl || null,
    };

    const request = this.data
      ? this.eventsService.updateEvent(this.data.eventId, formValue, this.selectedFile)
      : this.eventsService.createEvent(formValue, this.selectedFile);

    request
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.data ? 'Event updated' : 'Event created',
            'Close',
            { duration: 2000 }
          );
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Failed to save event',
            'Close',
            { duration: 3000 }
          );
          this.submitting = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
    }
  }
}
