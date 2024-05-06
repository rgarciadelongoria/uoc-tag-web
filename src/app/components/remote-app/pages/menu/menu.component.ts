import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import { AlertController, IonAccordionGroup, IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '@components/remote-app/components/header/header.component';
import { QrCodeModule } from 'ng-qrcode';
import { UuidService } from '@services/uuid.service';
import { RouterModule } from '@angular/router';
import { AlertCodes, GlobalKeys, Languages, LocalStorageKeys } from '@enums/global.enum';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '@services/storage.service';
import { PushService } from '@services/push.service';
import { OnboardingComponent } from '@modals/onboarding/onboarding.component';
import { UserService } from '@services/user.service';
import { UserData } from '@interfaces/user.interface';
import { environment } from '@environments/environment';
import { ShellEvents } from '@enums/shell.enum';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    QrCodeModule,
    HeaderComponent,
    TranslateModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @HostListener(`window:${ShellEvents.SHELL_BROWSER_OPEN_RESPONSE}`, ['$event'])
  async handleShellBrowserOpenResponse(event: any) {
    await this.onBrowserOpenResponse(event.detail?.response || {});
  }
  
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;


  public qrUuid = '';
  public languages = Languages;
  public currentLanguage = Languages.EN;
  public isSynced = false;
  public uuid = '';
  public pushToken = '';
  public user: UserData = {} as UserData;
  public environment = environment;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly uuidSrv: UuidService,
    private readonly pushSrv: PushService,
    private readonly storageSrv: StorageService,
    private readonly userSrv: UserService,
    private translateSrv: TranslateService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.initLogic();
  }

  public changeLanguage(lang: string): void {
    this.storageSrv.setItem(LocalStorageKeys.LANGUAGE, lang);
    this.translateSrv.use(lang);
    this.cdr.detectChanges();
  }

  public async deSyncDevice(): Promise<void> {
    const role = await this.presentAlertConfirmDeSyncUuid();
    if (role === AlertCodes.ACCEPT) {
      this.storageSrv.removeItem(LocalStorageKeys.APP_UUID);
      this.storageSrv.removeItem(LocalStorageKeys.APP_SYNC_MARK);
      this.isSynced = false;
      // Init uuid and register device logic
      this.pushSrv.init();
      await this.uuidSrv.init();
      setTimeout(() => {
        this.initLogic();
      }, 400); // TODO: Do a $Subject or $Observable to listen for the event SHELL_DEVICE_GET_ID_RESPONSE
      this.cdr.detectChanges();
    }
  }

  private initLogic(): void {
    this.qrUuid = GlobalKeys.UUID_QR_CODE + this.uuidSrv.getUuid();
    this.isSynced = !!this.storageSrv.getItem(LocalStorageKeys.APP_SYNC_MARK);
    this.currentLanguage = this.storageSrv.getItem(LocalStorageKeys.LANGUAGE) || Languages.EN;
    this.uuid = this.uuidSrv.getUuid();
    this.pushToken = this.pushSrv.getToken();
    this.user = this.userSrv.getUser();
    this.cdr.detectChanges();
  }

  public async launchOnboarding(): Promise<void> {
    const modal = await this.modalController.create({
      component: OnboardingComponent,
    });
    modal.present();

    await modal.onWillDismiss();

    // Init uuid and register device logic
    this.pushSrv.init();
    await this.uuidSrv.init();

    const language = this.storageSrv.getItem(LocalStorageKeys.LANGUAGE) || Languages.EN;
    this.translateSrv.use(language);
    this.currentLanguage = this.storageSrv.getItem(LocalStorageKeys.LANGUAGE) || Languages.EN;

    this.storageSrv.setItem(LocalStorageKeys.ONBOARDING, true);
  }

  public toggleAccordion(): void {
    const nativeEl = this.accordionGroup;
    if (nativeEl.value === 'first') {
      nativeEl.value = undefined;
    } else {
      nativeEl.value = 'first';
    }
  };

  public buyMeACoffee(): void {
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_BROWSER_OPEN, {
      detail: {
        url: 'https://www.buymeacoffee.com/longocode'
      },
    }));
  }

  private async presentAlertConfirmDeSyncUuid(): Promise<AlertCodes> {
    const alert = await this.alertController.create({
      header: this.translateSrv.instant('UUID.DESYNC_DEVICE'),
      subHeader: this.translateSrv.instant('GLOBAL.IRREVERSIBLE_ACTION'),
      message: this.translateSrv.instant('UUID.DESYNC_DEVICE_QUESTION'),
      buttons: [
        {
          text: this.translateSrv.instant('GLOBAL.CANCEL'),
          role: AlertCodes.CANCEL,
          handler: () => {
            // Nothing to do
          },
        },
        {
          text: this.translateSrv.instant('GLOBAL.ACCEPT'),
          role: AlertCodes.ACCEPT,
          handler: () => {
            // Nothing to do
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role as AlertCodes;
  }

  private onBrowserOpenResponse(response: any): void {
    console.log('Browser open response', response);
  }
}
