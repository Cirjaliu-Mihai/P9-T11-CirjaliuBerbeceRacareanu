import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryStore } from '../../../core/state/library.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reader-shell',
  templateUrl: './reader-shell.component.html',
  styleUrl: './reader-shell.component.css',
  standalone: false,
})
export class ReaderShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly store = inject(LibraryStore);
  private readonly router = inject(Router);

  private sessionSubscription?: Subscription;

  get isReader(): boolean {
    return this.auth.role() === 'Reader';
  }

  ngOnInit() {
    this.sessionSubscription = this.auth.session$.subscribe((session) => {
      this.store.setViewerRole(session?.role ?? null);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription?.unsubscribe();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/auth');
    });
  }
}
