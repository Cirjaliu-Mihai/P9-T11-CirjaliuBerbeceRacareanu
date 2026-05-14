import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { roleGuard } from '../../core/guards/auth.guard';
import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AddCopiesDialogComponent } from './dialogs/add-copies-dialog/add-copies-dialog.component';
import { BookEditorDialogComponent } from './dialogs/book-editor-dialog/book-editor-dialog.component';
import { BooksViewComponent } from './pages/books-view/books-view.component';
import { BranchEditorDialogComponent } from './dialogs/branch-editor-dialog/branch-editor-dialog.component';
import { BranchViewComponent } from './pages/branch-view/branch-view.component';
import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { DeleteConfirmationDialogComponent } from './dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ManageCopiesDialogComponent } from './dialogs/manage-copies-dialog/manage-copies-dialog.component';
import { ReportsViewComponent } from './pages/reports-view/reports-view.component';
import { ReturnsViewComponent } from './pages/returns-view/returns-view.component';
import { UserViewComponent } from './pages/user-view/user-view.component';

const adminGuard = roleGuard('Administrator');

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: 'overview', component: DashboardOverviewComponent, canActivate: [adminGuard] },
      { path: 'branches', component: BranchViewComponent, canActivate: [adminGuard] },
      { path: 'books', component: BooksViewComponent, canActivate: [adminGuard] },
      { path: 'users', component: UserViewComponent, canActivate: [adminGuard] },
      { path: 'returns', component: ReturnsViewComponent, canActivate: [adminGuard] },
      { path: 'reports', component: ReportsViewComponent, canActivate: [adminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
    ],
  },
];

@NgModule({
  declarations: [
    AdminShellComponent,
    DashboardOverviewComponent,
    BranchViewComponent,
    BooksViewComponent,
    UserViewComponent,
    ReturnsViewComponent,
    ReportsViewComponent,
    BranchEditorDialogComponent,
    BookEditorDialogComponent,
    AddCopiesDialogComponent,
    ManageCopiesDialogComponent,
    DeleteConfirmationDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class LibraryModule {}
