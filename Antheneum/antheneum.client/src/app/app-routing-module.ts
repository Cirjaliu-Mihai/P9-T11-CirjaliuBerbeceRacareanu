import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reader' },
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
  { path: '**', redirectTo: 'reader' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
