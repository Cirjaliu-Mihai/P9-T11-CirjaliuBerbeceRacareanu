import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { DashboardOverviewComponent } from './dashboard-overview.component';
import {
  BookEditorDialogComponent,
  BranchEditorDialogComponent,
  DeleteConfirmationDialogComponent,
} from './library-dialogs.component';
import { LibraryManagementPageComponent } from './library-management-page.component';
import { MyLoansPageComponent } from './my-loans-page.component';
import { ProfileEditorDialogComponent } from './profile-dialog.component';
import { ReaderManagementPageComponent } from './reader-management-page.component';
import { ReportsPageComponent } from './reports-page.component';
import { ReturnsPageComponent } from './returns-page.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    App,
    DashboardOverviewComponent,
    BranchEditorDialogComponent,
    BookEditorDialogComponent,
    DeleteConfirmationDialogComponent,
    LibraryManagementPageComponent,
    ReaderManagementPageComponent,
    ReturnsPageComponent,
    ReportsPageComponent,
    MyLoansPageComponent,
    ProfileEditorDialogComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule, FormsModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
