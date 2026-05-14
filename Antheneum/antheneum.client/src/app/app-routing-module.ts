import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksViewComponent } from './admin/books-view.component';
import { BranchViewComponent } from './admin/branch-view.component';
import { DashboardOverviewComponent } from './admin/dashboard-overview.component';
import { ReportsViewComponent } from './admin/reports-view.component';
import { ReturnsViewComponent } from './admin/returns-view.component';
import { UserViewComponent } from './admin/user-view.component';
import { AuthPageComponent } from './auth/auth-page.component';
import { guestGuard, roleGuard } from './auth/auth.guard';
import { MyLoansPageComponent } from './reader/my-loans-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', component: AuthPageComponent, canActivate: [guestGuard] },
  { path: 'overview', component: DashboardOverviewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'branches', component: BranchViewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'books', component: BooksViewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'users', component: UserViewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'returns', component: ReturnsViewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'reports', component: ReportsViewComponent, canActivate: [roleGuard('Administrator')] },
  { path: 'library', redirectTo: 'branches', pathMatch: 'full' },
  { path: 'readers', redirectTo: 'users', pathMatch: 'full' },
  { path: 'loans', component: MyLoansPageComponent, canActivate: [roleGuard('Reader')] },
  { path: '**', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
