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
import { DeleteConfirmationDialogComponent } from './dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ManageCopiesDialogComponent } from './dialogs/manage-copies-dialog/manage-copies-dialog.component';
import { ReportsViewComponent } from './pages/reports-view/reports-view.component';
import { ReturnsViewComponent } from './pages/returns-view/returns-view.component';
import { UserViewComponent } from './pages/user-view/user-view.component';
import { EventsViewComponent } from './pages/events-view/events-view.component';
import { EventEditorDialogComponent } from './dialogs/event-editor-dialog/event-editor-dialog.component';
import { EventAttendeesDialogComponent } from './dialogs/event-attendees-dialog/event-attendees-dialog.component';

const adminGuard = roleGuard('Administrator');

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: 'branches', component: BranchViewComponent, canActivate: [adminGuard] },
      { path: 'books', component: BooksViewComponent, canActivate: [adminGuard] },
      { path: 'users', component: UserViewComponent, canActivate: [adminGuard] },
      { path: 'returns', component: ReturnsViewComponent, canActivate: [adminGuard] },
      { path: 'reports', component: ReportsViewComponent, canActivate: [adminGuard] },
      { path: 'events', component: EventsViewComponent, canActivate: [adminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'branches' },
      { path: '**', redirectTo: 'branches' },
    ],
  },
];

@NgModule({
  declarations: [
    AdminShellComponent,
    BranchViewComponent,
    BooksViewComponent,
    UserViewComponent,
    ReturnsViewComponent,
    ReportsViewComponent,
    EventsViewComponent,
    BranchEditorDialogComponent,
    BookEditorDialogComponent,
    AddCopiesDialogComponent,
    ManageCopiesDialogComponent,
    DeleteConfirmationDialogComponent,
    EventEditorDialogComponent,
    EventAttendeesDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class LibraryModule {}
