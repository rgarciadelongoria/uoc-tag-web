import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() public showMenu: boolean = true;

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private translateSrv: TranslateService
  ) {}

  public changeLanguage(lang: string): void {
    this.translateSrv.use(lang);
    this.cdr.detectChanges();
  }

  public openMenu(): void {
    this.router.navigate(['/main/', 'menu']);
  }
}
