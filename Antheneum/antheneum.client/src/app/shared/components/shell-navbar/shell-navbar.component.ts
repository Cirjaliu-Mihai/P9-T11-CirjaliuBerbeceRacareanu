import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shell-navbar',
  templateUrl: './shell-navbar.component.html',
  styleUrl: './shell-navbar.component.css',
  standalone: false,
})
export class ShellNavbarComponent {
  @Input() workspaceEyebrow = '';
  @Input() workspaceTitle = '';
  @Input() sections: Array<{ path: string; label: string; eyebrow: string }> = [];
  @Input() username = '';

  @Output() readonly signOut = new EventEmitter<void>();

  onSignOut() {
    this.signOut.emit();
  }
}