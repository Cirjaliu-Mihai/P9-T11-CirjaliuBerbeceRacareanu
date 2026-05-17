import { Component, OnDestroy, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Reader } from '../../../../models/reader/reader.model';
import { ReadersStore } from '../../../../core/state/readers.store';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
  standalone: false,
})
export class UserViewComponent implements OnDestroy {
  readonly store = inject(ReadersStore);

  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateRole(reader: Reader, nextRole: string) {
    this.store
      .updateReaderRole(reader, nextRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => this.snackBar.open('Failed to update role.', 'Dismiss', { duration: 4000 }),
      });
  }
}
