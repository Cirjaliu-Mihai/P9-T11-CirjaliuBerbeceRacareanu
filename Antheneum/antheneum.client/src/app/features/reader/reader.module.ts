import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { roleGuard } from '../../core/guards/auth.guard';
import { MyLoansPageComponent } from './pages/my-loans-page/my-loans-page.component';
import { ProfileEditorDialogComponent } from './dialogs/profile-editor-dialog/profile-dialog.component';

const readerGuard = roleGuard('Reader');

const routes: Routes = [
  { path: 'loans', component: MyLoansPageComponent, canActivate: [readerGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'loans' },
];

@NgModule({
  declarations: [MyLoansPageComponent, ProfileEditorDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReaderModule {}
