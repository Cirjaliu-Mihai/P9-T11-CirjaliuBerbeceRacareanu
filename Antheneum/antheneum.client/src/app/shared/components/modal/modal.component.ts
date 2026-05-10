import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() title = '';
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
