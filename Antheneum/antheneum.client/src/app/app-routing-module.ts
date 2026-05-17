import { Component, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { AuthService } from './core/services/auth.service';

/** Minimal component used only to perform a role-aware redirect on the root path. */
@Component({ template: '', standalone: true })
class HomeRedirectComponent {
  constructor(auth: AuthService, router: Router) {
    void router.navigateByUrl(auth.defaultRouteFor());
  }
}

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeRedirectComponent },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/library/library.module').then((m) => m.LibraryModule),
  },
  {
    path: 'reader',
    loadChildren: () => import('./features/reader/reader.module').then((m) => m.ReaderModule),
  },
  { path: '**', component: HomeRedirectComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
