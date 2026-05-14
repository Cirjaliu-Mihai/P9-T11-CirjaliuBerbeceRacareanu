import { Component } from '@angular/core';
import { AdminDashboardStore } from './admin-dashboard.store';

@Component({
  selector: 'app-reports-view',
  template: `
    <mat-card class="panel">
      <div class="panel-heading">
        <div>
          <p class="kicker">Reports page</p>
          <h3>Generate operational tables</h3>
        </div>
        <mat-chip-set>
          <mat-chip>{{ store.reportStatus }}</mat-chip>
        </mat-chip-set>
      </div>

      <div class="toolbar wide">
        <mat-form-field appearance="outline">
          <mat-label>Report type</mat-label>
          <mat-select [(ngModel)]="store.selectedReportType">
            <mat-option *ngFor="let reportType of store.reportTypes" [value]="reportType.id">{{ reportType.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Branch</mat-label>
          <mat-select [(ngModel)]="store.selectedBranchId">
            <mat-option value="">All branches</mat-option>
            <mat-option *ngFor="let branch of store.branches" [value]="branch.branchId">{{ branch.name }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="store.selectedReportType === 'transactions'">
          <mat-label>From</mat-label>
          <input matInput type="date" [(ngModel)]="store.reportFrom" />
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="store.selectedReportType === 'transactions'">
          <mat-label>To</mat-label>
          <input matInput type="date" [(ngModel)]="store.reportTo" />
        </mat-form-field>

        <button mat-flat-button type="button" (click)="store.generateReport()">Generate</button>
      </div>

      <div class="report-helper">
        {{ store.reportTypes.find((item) => item.id === store.selectedReportType)?.helper }}
      </div>

      <mat-card *ngIf="store.isReportLoading" class="empty-state">
        <strong>Building report</strong>
        <p>Loading the latest view from the API.</p>
      </mat-card>

      <div *ngIf="!store.isReportLoading" class="table-wrap">
        <table *ngIf="store.selectedReportType === 'inventory'">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Book</th>
              <th>ISBN</th>
              <th>Total</th>
              <th>Available</th>
              <th>Borrowed</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of store.inventoryReport">
              <td>{{ row.branchName }}</td>
              <td>{{ row.title }}</td>
              <td>{{ row.isbn }}</td>
              <td>{{ row.totalCopies }}</td>
              <td>{{ row.availableCopies }}</td>
              <td>{{ row.borrowedCopies }}</td>
            </tr>
          </tbody>
        </table>

        <table *ngIf="store.selectedReportType === 'overdue'">
          <thead>
            <tr>
              <th>Reader</th>
              <th>Book</th>
              <th>Branch</th>
              <th>Due date</th>
              <th>Overdue</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of store.overdueReport">
              <td>{{ row.username }}</td>
              <td>{{ row.bookTitle }}</td>
              <td>{{ row.branchName }}</td>
              <td>{{ row.dueDate }}</td>
              <td>{{ row.overdueDays }} days</td>
              <td>{{ row.loanFineTotal | currency }}</td>
            </tr>
          </tbody>
        </table>

        <table *ngIf="store.selectedReportType === 'blacklist'">
          <thead>
            <tr>
              <th>Reader</th>
              <th>Reason</th>
              <th>Branch</th>
              <th>Penalty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of store.blacklistReport">
              <td>{{ row.username }}</td>
              <td>{{ row.reason || 'Review needed' }}</td>
              <td>{{ row.branchName || 'Not linked' }}</td>
              <td>{{ row.penaltyAmount | currency }}</td>
              <td>
                <mat-chip-set>
                  <mat-chip [class.is-preview]="!row.isResolved">{{ row.isResolved ? 'Resolved' : 'Open' }}</mat-chip>
                </mat-chip-set>
              </td>
            </tr>
          </tbody>
        </table>

        <table *ngIf="store.selectedReportType === 'transactions'">
          <thead>
            <tr>
              <th>Loan</th>
              <th>Reader</th>
              <th>Book</th>
              <th>Branch</th>
              <th>Loan date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of store.transactionReport">
              <td>#{{ row.loanId }}</td>
              <td>{{ row.username }}</td>
              <td>{{ row.bookTitle }}</td>
              <td>{{ row.branchName }}</td>
              <td>{{ row.loanDate }}</td>
              <td>
                <mat-chip-set>
                  <mat-chip>{{ row.transactionStatus }}</mat-chip>
                </mat-chip-set>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </mat-card>
  `,
  standalone: false,
})
export class ReportsViewComponent {
  constructor(public readonly store: AdminDashboardStore) {}
}