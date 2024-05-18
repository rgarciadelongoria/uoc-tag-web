import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { ShellActions, ShellEvents } from '@enums/shell.enum';
import { TicketService } from '@services/ticket.service';
import { AlertCodes, GameCodes, GlobalKeys, LocalStorageKeys } from '@enums/global.enum';
import { UuidService } from '@services/uuid.service';
import { UserService } from '@services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GameService } from '@services/game.service';
import { GameTicketPrizeData } from '@interfaces/game.interface';
import { TicketLnComponent } from '@components/remote-app/components/ticket-ln/ticket-ln.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    TranslateModule,
    TicketLnComponent,
    ZXingScannerModule
  ],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanComponent implements OnInit {
  @HostListener(`window:${ShellEvents.SHELL_SCANNER_RESPONSE}`, ['$event'])
  async handleShellScannerResponse(event: any) {
    await this.onScannerResponse(event.detail?.response || {});
  }

  @HostListener(`window:${ShellEvents.SHELL_SCANNER_ERROR}`, ['$event'])
  async handleShellScannerError(event: any) {
    await this.onScannerError(event.detail?.response || {});
  }

  public gameCodes = GameCodes;
  public hasShell = false;
  public responses: any[] = [];
  public hasPermission = true;
  public ticketData: GameTicketPrizeData | null = null;
  public showTicket = false;
  public allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX
  ];
  public showWebScan = false;
  public hasWebCamera = false;

  
  private backgroundColor = '';
  
  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ticketSrv: TicketService,
    private readonly uuidSrv: UuidService,
    private readonly userSrv: UserService,
    private readonly gameSrv: GameService,
    private readonly loadingCtrl: LoadingController,
    private readonly translateSrv: TranslateService,
    private readonly storageSrv: StorageService,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async ionViewDidEnter(): Promise<void> {
    this.setTicketVisibility(false);
    this.showWebScan = !this.storageSrv.getItem(ShellActions.SHELL_VERSION);
    this.cdr.detectChanges();
    document.body.style.backgroundColor = "transparent";
    await this.startScan();
  }

  ionViewWillLeave(): void {
    this.setTicketVisibility(false);
    document.body.style.backgroundColor = this.backgroundColor;
    this.stopScan();
  }

  public async startScan(event?: any): Promise<void> {
    this.showWebScan = !this.storageSrv.getItem(ShellActions.SHELL_VERSION);
    this.hasPermission = true;
    this.cdr.detectChanges();
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_SCANNER_START));
  }
  public stopScan(event?: any): void {
    this.showWebScan = false;
    this.cdr.detectChanges();
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_SCANNER_STOP));
  }

  public permissionResponse(event: any): void {
    this.hasPermission = event || false;
  }

  public setTicketVisibility(value: boolean): void {
    this.showTicket = value;
    if (this.showTicket) {
      document.querySelector('ion-tabs')!.style.padding = '0'
    } else {
      document.querySelector('ion-tabs')!.style.padding = ''
    }
    this.cdr.detectChanges();
  }

  public async tapTicket(event: any): Promise<void> {
    this.setTicketVisibility(false);
    await this.startScan();
  }

  public webCodeResult(code: string): void {
    this.onScannerResponse({content: code});
  }

  public webCamerasFound(cameras: MediaDeviceInfo[]): void {
    console.log('cameras', cameras);
    if (cameras.length > 0) {
      this.hasWebCamera = true;
    }
  }

  private async onScannerResponse(response: any): Promise<void> {
    this.ticketData = null;
    const responseValue = response.displayValue || '';
    if (this.checkUuidQRCode(responseValue || '')) {
      // Scan uuid logic
      const uuid = responseValue.toString().replace(GlobalKeys.UUID_QR_CODE, '');
      await this.syncUuid(uuid);
      this.setTicketVisibility(false);
      await this.startScan();
    } else if (response && !response.closed) {
      // Scan ticket logic
      this.setTicketVisibility(true);
      this.showLoading();
      let ticketId = '';
      try {
        const ticketData = await this.ticketSrv.createNewTicket(responseValue || '');
        ticketId = ticketData._id || '';
        this.storageSrv.setItem(LocalStorageKeys.RELOAD_TICKETS, true);
        this.cdr.detectChanges();
      } catch (error) {
        ticketId = (error as any).error?.ticket?._id || '';
        this.cdr.detectChanges();
      }
      try {
        this.ticketData = await this.gameSrv.getTicketPrizeByTicketId(ticketId);
        this.dismissLoading();
      } catch (error) {
        this.setTicketVisibility(false);
        await this.presentAlertInvalidCode();
        await this.startScan();
      }
    }
    this.cdr.detectChanges();
  }

  private async onScannerError(response: any): Promise<void> {
    this.hasPermission = false;
  }

  private checkUuidQRCode(response: any): boolean {
    if (response.toString().includes(GlobalKeys.UUID_QR_CODE)) {
      return true;
    }
    return false;
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: await this.translateSrv.instant('SCAN.MESSAGES.CHECKING_TICKETS'),
      duration: 5000,
    });

    loading.present();
  }

  private async dismissLoading() {
    await this.loadingCtrl.dismiss();
  }

  private async presentAlertInvalidCode(): Promise<AlertCodes> {
    this.dismissLoading();
    const alert = await this.alertController.create({
      header: this.translateSrv.instant('GLOBAL.INVALID_CODE'),
      subHeader: this.translateSrv.instant('GLOBAL.INVALID_GAME'),
      message: this.translateSrv.instant('GLOBAL.INVALID_CODE_TEXT'),
      buttons: [
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

  private async presentAlertConfirmSyncUuid(): Promise<AlertCodes> {
    const alert = await this.alertController.create({
      header: this.translateSrv.instant('UUID.SYNC_DEVICE'),
      subHeader: this.translateSrv.instant('GLOBAL.CONFIG_ACTION'),
      message: this.translateSrv.instant('UUID.SYNC_DEVICE_QUESTION'),
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

  private async syncUuid(uuid: string): Promise<void> {
    const role = await this.presentAlertConfirmSyncUuid();
    if (role === AlertCodes.ACCEPT) {
      this.uuidSrv.updateAppUuid(uuid);
      await this.userSrv.loginByUuid(uuid);
    }
  }
}
