import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, AdminRoutingModule],
})
export class AdminModule {}
