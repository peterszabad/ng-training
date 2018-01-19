import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { environment } from '../../../environments/environment';
import { User } from '../../user/';

@Injectable()
export class AuthService {

  public user: User;
  public token: string;

  constructor(private _http: HttpClient, private _router: Router) {
    this._loadFromStorage();
  }

  public login(user: User): Observable<Response> {
    const observable: Observable<Response> = this._http.post<Response>(
      environment.apiEndpoint + '/auth',
      user
    );
    const subject = new Subject<any>();
    observable.subscribe(
      (response: Response) => {
        this.user = response['user'];
        this.token = response['token'];
        this._saveToStorage();
        
        /* Uncomment to  */
        const TOKEN_INVALIDATION_TIMEOUT_SEC = 10;
        setTimeout(() => {
          if (this.token) {
            const invalidationSuffix = '_expired';
            this.token = this.token + invalidationSuffix;//.substring(0, this.token.length-invalidationSuffix.length) + invalidationSuffix;
            console.log(`Just invalidated your token. Cheers`);
          }
        }, TOKEN_INVALIDATION_TIMEOUT_SEC * 1000);
        
        subject.next(response);
      },
      (error: any) => {
        this.token = undefined;
        subject.error(error);
      }
    );
    return subject.asObservable();
  }

  public logout(): void {
    this.user = undefined;
    this.token = undefined;
    this._saveToStorage();
    this._router.navigate(['/']);
  }

  private _saveToStorage(): void {
    if (this.token) {
      localStorage.setItem('token', this.token);
    } else {
      localStorage.removeItem('token');
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    } else {
      localStorage.removeItem('user');
    }
  }

  private _loadFromStorage(): void {
    this.token = localStorage.getItem('token');
    const userString: string = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : undefined;
  }

}
