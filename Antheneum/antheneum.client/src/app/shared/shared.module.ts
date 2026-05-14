import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { ShellNavbarComponent } from './components/shell-navbar/shell-navbar.component';

@NgModule({
  declarations: [ShellNavbarComponent],
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    ShellNavbarComponent,
  ],
})
export class SharedModule {}
