import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { roleGuard } from '../../core/guards/auth.guard';
import { MyLoansPageComponent } from './pages/my-loans-page/my-loans-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { EventsPageComponent } from './pages/events-page/events-page.component';
import { ReaderShellComponent } from './reader-shell/reader-shell.component';
import { ProfileEditorDialogComponent } from './dialogs/profile-editor-dialog/profile-dialog.component';
import { BookDetailDialogComponent } from './dialogs/book-detail-dialog/book-detail-dialog.component';
import { BorrowConfirmDialogComponent } from './dialogs/borrow-confirm-dialog/borrow-confirm-dialog.component';
import { EventDetailDialogComponent } from './dialogs/event-detail-dialog/event-detail-dialog.component';

const readerGuard = roleGuard('Reader');

const routes: Routes = [
  {
    path: '',
    component: ReaderShellComponent,
    children: [
      { path: 'catalog', component: CatalogPageComponent },
      { path: 'events', component: EventsPageComponent },
      { path: 'loans', component: MyLoansPageComponent, canActivate: [readerGuard] },
      { path: 'checkout', component: CheckoutPageComponent, canActivate: [readerGuard] },
      { path: 'profile', component: ProfilePageComponent, canActivate: [readerGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'catalog' },
    ],
  },
];

@NgModule({
  declarations: [
    ReaderShellComponent,
    CatalogPageComponent,
    MyLoansPageComponent,
    CheckoutPageComponent,
    ProfilePageComponent,
    EventsPageComponent,
    ProfileEditorDialogComponent,
    BookDetailDialogComponent,
    BorrowConfirmDialogComponent,
    EventDetailDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReaderModule {}
