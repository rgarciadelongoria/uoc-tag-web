import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Pipe({
  name: 'date',
  standalone: true,
})
export class CustomDatePipe implements PipeTransform {
 
  constructor(private translateService: TranslateService) {}
 
  public transform(value: any): Observable<string> {
    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    let finalValue = date.toLocaleDateString(this.translateService.currentLang, options);

    const finalValue$ = new BehaviorSubject(finalValue);
    
    this.translateService.onLangChange.subscribe(() => {
      finalValue = date.toLocaleDateString(this.translateService.currentLang, options);
      return finalValue$.next(finalValue);
    });

    return finalValue$;
  }
}