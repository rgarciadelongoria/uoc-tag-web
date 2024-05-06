import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, retry, throwError } from 'rxjs';
import { LocalStorageKeys } from '@enums/global.enum';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

export interface HttpOptions {
  headers?: HttpHeaders | {
      [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?: {
      includeHeaders?: string[];
  } | boolean;
}

export enum HttpApiErrors {
  UNAUTHORIZED = 'Unauthorized',
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly storageSrv: StorageService,
  ) { }

  /*
  HTTP Methods
  */

  public get<T>(url: string, options?: HttpOptions): Observable<T> {
    options = this.addTokenToHeaders(options);

    return this.http.get<T>(url, options);
  }

  public post<T>(url: string, body: any | null, options?: HttpOptions): Observable<T> {
    options = this.addPostHeaders(options);
    options = this.addTokenToHeaders(options);
    
    return this.http.post<T>(url, body, options)
    .pipe(this.handleErrorAndRedirect())
  }

  public delete<T>(url: string, options?: HttpOptions): Observable<T> {
    options = this.addTokenToHeaders(options);

    return this.http.delete<T>(url, options);
  }

  /*
  Interceptor logic
  */

  private addTokenToHeaders(options?: HttpOptions): HttpOptions {
    const currentTokenData = this.storageSrv.getItem(LocalStorageKeys.TOKEN);

    const headers: [string, string][] = [
      ['Authorization', `Bearer ${currentTokenData?.token}`]
    ];

    return this.addHeaders(headers, options);
  }

  private addPostHeaders(options?: HttpOptions): HttpOptions {
    const headers: [string, string][] = [
      ['Content-Type', 'application/json']
    ];

    return this.addHeaders(headers, options);
  }

  private addHeaders(headers: [string, string][], options?: HttpOptions): HttpOptions {
    headers.forEach(header => {
      options = options || {};
      options.headers = options.headers || {};
      if (options.headers instanceof HttpHeaders) {
        options.headers = options.headers.append(header[0], header[1]);
      } else if (typeof options.headers === 'object') {
        options.headers[header[0]] = header[1];
      }
    });

    return options || {};
  }

  private handleErrorAndRedirect() {
    return catchError(async (err: any, caught: Observable<any>) => {
      if (err.status === 401 && err.statusText === HttpApiErrors.UNAUTHORIZED) {
        this.storageSrv.removeItem(LocalStorageKeys.TOKEN);
        this.router.navigate(['/', 'main']);
      }
      throw err;
    });
  }
}
