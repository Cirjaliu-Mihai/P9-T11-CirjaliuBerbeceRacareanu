import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() appTitle = 'Antheneum';

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
