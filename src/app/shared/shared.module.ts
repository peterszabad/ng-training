import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NotFoundComponent } from './components/not-found/not-found.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ApiService, AuthService, AuthGuard } from './';
import { SessionExpiredInterceptor } from './interceptors/session-expired.interceptor';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [
    ApiService,
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionExpiredInterceptor,
      multi: true
    }
  ],
  declarations: [
    NotFoundComponent,
    NavigationComponent
  ],
  exports: [
    NavigationComponent
  ]
})
export class SharedModule { }
