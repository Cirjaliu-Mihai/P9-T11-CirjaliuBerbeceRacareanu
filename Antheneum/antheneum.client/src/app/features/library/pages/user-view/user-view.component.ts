import { Component } from '@angular/core';
import { Reader } from '../../../../models/reader/reader.model';
import { LibraryStore } from '../../../../core/state/library.store';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
  standalone: false,
})
export class UserViewComponent {
  constructor(public readonly store: LibraryStore) {}

  updateRole(reader: Reader, nextRole: string) {
    this.store.updateReaderRole(reader, nextRole).subscribe();
  }
}
