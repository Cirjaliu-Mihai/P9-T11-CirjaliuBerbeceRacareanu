import { Component } from '@angular/core';
import { LibraryStore } from '../../../../core/state/library.store';

@Component({
  selector: 'app-reports-view',
  templateUrl: './reports-view.component.html',
  styleUrl: './reports-view.component.css',
  standalone: false,
})
export class ReportsViewComponent {
  constructor(public readonly store: LibraryStore) {}
}
