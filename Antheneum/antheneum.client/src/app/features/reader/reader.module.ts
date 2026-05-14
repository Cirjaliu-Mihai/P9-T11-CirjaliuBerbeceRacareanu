import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { roleGuard } from '../../core/guards/auth.guard';
import { MyLoansPageComponent } from './pages/my-loans-page/my-loans-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';
import { ReaderShellComponent } from './reader-shell/reader-shell.component';
import { ProfileEditorDialogComponent } from './dialogs/profile-editor-dialog/profile-dialog.component';
import { BookDetailDialogComponent } from './dialogs/book-detail-dialog/book-detail-dialog.component';
import { BorrowConfirmDialogComponent } from './dialogs/borrow-confirm-dialog/borrow-confirm-dialog.component';

const readerGuard = roleGuard('Reader');

const routes: Routes = [
  {
    path: '',
    component: ReaderShellComponent,
    children: [
      { path: 'catalog', component: CatalogPageComponent },
      { path: 'loans', component: MyLoansPageComponent, canActivate: [readerGuard] },
      { path: 'checkout', component: CheckoutPageComponent, canActivate: [readerGuard] },
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
    ProfileEditorDialogComponent,
    BookDetailDialogComponent,
    BorrowConfirmDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReaderModule {}
