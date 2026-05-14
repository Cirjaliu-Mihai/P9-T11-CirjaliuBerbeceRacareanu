import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ThreeBackgroundModule } from '../../shared/three-background/three-background.module';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { guestGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: AuthPageComponent, canActivate: [guestGuard] },
];

@NgModule({
  declarations: [AuthPageComponent],
  imports: [SharedModule, ThreeBackgroundModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
