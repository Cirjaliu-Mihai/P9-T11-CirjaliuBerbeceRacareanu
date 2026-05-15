import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { BookCopy } from '../../models/library/book-copy.model';
import { CopiesService } from '../services/copies.service';

@Injectable({ providedIn: 'root' })
export class CopiesStore {
  readonly copies = signal<BookCopy[]>([]);
  readonly isLoading = signal(false);

  selectedBookId: number | null = null;

  constructor(private readonly copiesService: CopiesService) {}

  loadCopies(bookId: number): void {
    this.selectedBookId = bookId;
    this.copies.set([]);
    this.isLoading.set(true);

    this.copiesService.getByBook(bookId).subscribe({
      next: (copies) => {
        this.copies.set(copies);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  addCopies(bookId: number, branchId: number, count: number) {
    return this.copiesService.add(bookId, branchId, count).pipe(
      tap(() => {
        this.loadCopies(bookId);
      }),
    );
  }

  deleteCopy(copyId: number) {
    return this.copiesService.delete(copyId).pipe(
      tap(() => {
        this.copies.set(this.copies().filter((c) => c.copyId !== copyId));
      }),
    );
  }

  updateStatus(copyId: number, status: string) {
    return this.copiesService.updateStatus(copyId, status).pipe(
      tap(() => {
        this.copies.set(this.copies().map((c) => (c.copyId === copyId ? { ...c, status } : c)));
      }),
    );
  }
}
