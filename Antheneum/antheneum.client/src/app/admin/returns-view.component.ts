import { Component } from '@angular/core';
import { BlacklistReport } from './admin-dashboard.models';
import { AdminDashboardStore } from './admin-dashboard.store';

@Component({
  selector: 'app-returns-view',
  template: `
    <section class="page-grid page-grid--two">
      <mat-card class="panel">
        <div class="panel-heading">
          <div>
            <p class="kicker">Process return</p>
            <h3>Lookup by loan id</h3>
          </div>
        </div>

        <div class="return-form">
          <mat-form-field appearance="outline">
            <mat-label>Loan id</mat-label>
            <input matInput type="number" [(ngModel)]="store.selectedReturnLoanId" placeholder="211" />
          </mat-form-field>
          <button mat-stroked-button type="button" (click)="store.lookupReturn()">Lookup</button>
        </div>

        <mat-card *ngIf="store.selectedReturn; else emptyReturnState" class="return-card">
          <p class="kicker">Return candidate</p>
          <h4>{{ store.selectedReturn.bookTitle }}</h4>
          <p>{{ store.selectedReturn.readerName }} at {{ store.selectedReturn.branchName }}</p>
          <dl>
            <div>
              <dt>Due date</dt>
              <dd>{{ store.selectedReturn.dueDate }}</dd>
            </div>
            <div>
              <dt>Overdue</dt>
              <dd>{{ store.selectedReturn.overdueDays }} days</dd>
            </div>
            <div>
              <dt>Fine</dt>
              <dd>{{ store.selectedReturn.fineAmount | currency }}</dd>
            </div>
          </dl>
          <button mat-flat-button type="button" (click)="confirmReturn()">Confirm return</button>
        </mat-card>

        <ng-template #emptyReturnState>
          <mat-card class="empty-state">
            <strong>No loan selected</strong>
            <p>Use a loan id from the overdue queue to process a return.</p>
          </mat-card>
        </ng-template>
      </mat-card>

      <mat-card class="panel">
        <div class="panel-heading">
          <div>
            <p class="kicker">Penalty queue</p>
            <h3>Blacklist resolution table</h3>
          </div>
          <mat-chip-set>
            <mat-chip>{{ store.blacklistReport.length }} unresolved</mat-chip>
          </mat-chip-set>
        </div>

        <div class="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Reader</th>
                <th>Reason</th>
                <th>Penalty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of store.blacklistReport">
                <td>
                  <strong>{{ entry.username }}</strong>
                  <p>{{ entry.libraryCardNumber }}</p>
                </td>
                <td>{{ entry.reason || 'Penalty review pending' }}</td>
                <td>{{ entry.penaltyAmount | currency }}</td>
                <td>
                  <button mat-stroked-button type="button" (click)="resolvePenalty(entry)">Resolve penalty</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </mat-card>
    </section>
  `,
  standalone: false,
})
export class ReturnsViewComponent {
  constructor(public readonly store: AdminDashboardStore) {}

  confirmReturn() {
    this.store.confirmReturn().subscribe();
  }

  resolvePenalty(entry: BlacklistReport) {
    this.store.resolvePenalty(entry).subscribe();
  }
}