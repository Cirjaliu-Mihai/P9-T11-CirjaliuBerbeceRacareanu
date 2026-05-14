import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { BooksViewComponent } from './admin/books-view.component';
import { BranchViewComponent } from './admin/branch-view.component';
import { DashboardOverviewComponent } from './admin/dashboard-overview.component';
import {
  BookEditorDialogComponent,
  BranchEditorDialogComponent,
  DeleteConfirmationDialogComponent,
} from './admin/library-dialogs.component';
import { ReportsViewComponent } from './admin/reports-view.component';
import { ReturnsViewComponent } from './admin/returns-view.component';
import { UserViewComponent } from './admin/user-view.component';
import { App } from './app';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AuthPageComponent } from './auth/auth-page.component';
import { ShellHeaderSummaryComponent } from './common/shell-header-summary.component';
import { ShellNavbarComponent } from './common/shell-navbar.component';
import { MaterialModule } from './material.module';
import { MyLoansPageComponent } from './reader/my-loans-page.component';
import { ProfileEditorDialogComponent } from './reader/profile-dialog.component';

@NgModule({
  declarations: [
    App,
    AuthPageComponent,
    DashboardOverviewComponent,
    BranchViewComponent,
    BooksViewComponent,
    UserViewComponent,
    ReturnsViewComponent,
    ReportsViewComponent,
    BranchEditorDialogComponent,
    BookEditorDialogComponent,
    DeleteConfirmationDialogComponent,
    MyLoansPageComponent,
    ProfileEditorDialogComponent,
    ShellNavbarComponent,
    ShellHeaderSummaryComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule, FormsModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [App]
})
export class AppModule { }
