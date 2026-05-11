import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardOverviewComponent } from './dashboard-overview.component';
import { LibraryManagementPageComponent } from './library-management-page.component';
import { MyLoansPageComponent } from './my-loans-page.component';
import { ReaderManagementPageComponent } from './reader-management-page.component';
import { ReportsPageComponent } from './reports-page.component';
import { ReturnsPageComponent } from './returns-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: 'overview', component: DashboardOverviewComponent },
  { path: 'library', component: LibraryManagementPageComponent },
  { path: 'readers', component: ReaderManagementPageComponent },
  { path: 'returns', component: ReturnsPageComponent },
  { path: 'reports', component: ReportsPageComponent },
  { path: 'loans', component: MyLoansPageComponent },
  { path: '**', redirectTo: 'overview' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
