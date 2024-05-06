import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';


@Injectable()
export class CustomTranslateLoader implements TranslateLoader  {

    constructor(private httpClient: HttpClient) {}
    getTranslation(lang: string): Observable<any> {
      const apiAddress = environment.web.host + `/assets/i18n/${lang}.json`;
      return this.httpClient.get(apiAddress)
      .pipe(
        catchError((error) => {
          console.log('Error loading translation file', error);
          return this.httpClient.get(environment.web.host + `/assets/i18n/es.json`)
        })
      );
    }
}