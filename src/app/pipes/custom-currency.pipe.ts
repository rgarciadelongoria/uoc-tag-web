import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Pipe({
  name: 'currency',
  standalone: true,
})
export class CustomCurrencyPipe implements PipeTransform {
 
  constructor(private translateService: TranslateService) {}
 
  public transform(value: any, currencyCode?: string): Observable<string> {
    const date = new Date(value);
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode || 'EUR'
    };
    
    let finalValue = new Intl.NumberFormat(this.getLocaleFromLang(this.translateService.currentLang), options).format(value);

    const finalValue$ = new BehaviorSubject(finalValue);
    
    this.translateService.onLangChange.subscribe(() => {
      finalValue = new Intl.NumberFormat(this.getLocaleFromLang(this.translateService.currentLang), options).format(value);
      return finalValue$.next(finalValue);
    });

    return finalValue$;
  }

  private getLocaleFromLang(lang: string): string {
    if (lang === 'es') {
      return 'es-ES';
    } else if (lang === 'en') {
      return 'en-US';
    }
    return 'en-US'
  }
}