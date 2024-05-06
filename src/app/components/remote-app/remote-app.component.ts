import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { UuidService } from '@services/uuid.service';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { TicketService } from '@services/ticket.service';
import { StorageService } from '@services/storage.service';
import { ShellErrors } from '@enums/shell.enum';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@utils/custom-translate-loader';
import { GameService } from '@services/game.service';
import { Languages, LocalStorageKeys } from '@enums/global.enum';
import { PushService } from '@services/push.service';

@Component({
  selector: 'app-remote-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HttpClientModule,
  ],
  providers: [
    ApiService,
    UuidService,
    PushService,
    UserService,
    TicketService,
    GameService,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
          deps: [HttpClient]
      }
    }).providers!
  ],
  templateUrl: './remote-app.component.html',
  styleUrl: './remote-app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RemoteAppComponent implements OnInit {
  
  constructor(
    private translateSrv: TranslateService,
    private readonly uuidSrv: UuidService,
    private readonly userSrv: UserService,
    private readonly storageSrv: StorageService,
    private readonly router: Router,
    private readonly pushSrv: PushService
  ) {
    this.translateSrv.setDefaultLang('en');
    this.translateSrv.use('en');
  }

  async ngOnInit(): Promise<void> {
    this.setNoErrorLoadingRemote();
    // Import external styles and scripts for shell
    this.importStyles();
    this.importScripts();
    // Init uuid and register device logic
    this.pushSrv.init();
    await this.uuidSrv.init();
    // Refresh token on navigation
    this.initRouterEventsSubscription();
    // Load language
    this.loadLanguage();
  }

  private initRouterEventsSubscription(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(async (event) => {
      await this.handleNavigationEnd();
    });
  }

  private async handleNavigationEnd(): Promise<void> {
    const uuid = this.uuidSrv.getUuid();
    if (uuid) {
      this.userSrv.checkTokenExpiration(uuid);
    } else {
      // Init uuid and register device logic
      this.pushSrv.init();
      await this.uuidSrv.init();
    }
  }

  /*
  App Logic
  */
  private loadLanguage() {
    const lang = this.storageSrv.getItem(LocalStorageKeys.LANGUAGE) || Languages.EN;
    this.translateSrv.use(lang);
  }

  /*
  Shell logic
  */

  private setNoErrorLoadingRemote() {
    this.storageSrv.setItem(ShellErrors.SHELL_LOADING_REMOTE_OK, "true");
  }

  private importScripts() {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js',
      'https://cdn.jsdelivr.net/npm/ionicons/dist/ionicons/ionicons.esm.js'
    ]

    const head = document.head;

    scripts.forEach(script => {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.src = script;
      scriptEl.async = false;
      document.head.appendChild(scriptEl);
      head.insertBefore(scriptEl, head.firstElementChild);
    });
  }

  private importStyles() {
    const styles = [
      'https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css',
      'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css'
    ]

    const head = document.head;

    styles.forEach(style => {
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = style;
      head.insertBefore(linkEl, head.firstElementChild);
    });
  }
}
