import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { BadgeComponent } from './components/badge/badge.component';
import { TableComponent } from './components/table/table.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  declarations: [NavbarComponent, BadgeComponent, TableComponent, ModalComponent],
  imports: [CommonModule, RouterModule],
  exports: [NavbarComponent, BadgeComponent, TableComponent, ModalComponent, CommonModule],
})
export class SharedModule {}
