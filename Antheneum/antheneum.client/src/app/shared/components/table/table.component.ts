import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent<T> {
  @Input() columns: { key: string; label: string }[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No data found.';

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<{ row: T; key: string }>;

  getValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }
}
