import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reader-shell',
  templateUrl: './reader-shell.component.html',
  styleUrl: './reader-shell.component.css',
  standalone: false,
})
export class ReaderShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get isReader(): boolean {
    return this.auth.role() === 'Reader';
  }

  logout() {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/auth');
    });
  }
}
