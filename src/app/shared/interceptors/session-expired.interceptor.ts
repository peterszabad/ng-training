import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { User } from '../../user/index';

@Injectable()
export class SessionExpiredInterceptor implements HttpInterceptor {

  private failedRequests: Array<HttpRequest<any>> = new Array();

  constructor(private _router: Router) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`Enqueued failed requests: `, this.failedRequests);
    console.log(`HttpHandler classname: ${next.constructor.name}`); 
    return next
      .handle(req)
      .do(response => {
        if (response instanceof HttpResponse) {
          if (response.body.token) {
            console.log(`Refreshed token, resending ${this.failedRequests.length} pending requests`);
            this.failedRequests
              .map(req => this._refreshAuthToken(req, response.body.token))
              .forEach(req => next.handle(req).subscribe(event => console.log(`Resent request - `, event)));
            this.failedRequests = [];
          }
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          console.log(`Intercepted error response: `, error);
          if (error.status === 400 && error.error.error.startsWith('token_')) {
            console.log(`Detected token error, enqueueing request for later`);
            this.failedRequests.push(req);
            this._logout();
          }
        }
      });
  }

  private _refreshAuthToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({headers: req.headers.set('Authorization', 'Bearer ' + token)});
  }

  private _logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

}