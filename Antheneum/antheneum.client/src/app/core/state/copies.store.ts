import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, tap } from 'rxjs';
import { BookCopy } from '../../models/library/book-copy.model';
import { CopiesService } from '../services/copies.service';

@Injectable({ providedIn: 'root' })
export class CopiesStore {
  private readonly copiesSubject = new BehaviorSubject<BookCopy[]>([]);
  private readonly isLoadingSubject = new BehaviorSubject(false);

  readonly copies$ = this.copiesSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  selectedBookId: number | null = null;

  constructor(private readonly copiesService: CopiesService) {}

  get copies(): BookCopy[] {
    return this.copiesSubject.value;
  }

  private set copies(value: BookCopy[]) {
    this.copiesSubject.next(value);
  }

  private set isLoading(value: boolean) {
    this.isLoadingSubject.next(value);
  }

  loadCopies(bookId: number): void {
    this.selectedBookId = bookId;
    this.copies = [];
    this.isLoading = true;

    this.copiesService.getByBook(bookId)
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({ next: (copies) => { this.copies = copies; } });
  }

  addCopies(bookId: number, branchId: number, count: number) {
    return this.copiesService.add(bookId, branchId, count).pipe(
      tap(() => { this.loadCopies(bookId); }),
    );
  }
}
