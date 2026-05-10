import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, HttpClientModule, SharedModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [App],
})
export class AppModule {}
