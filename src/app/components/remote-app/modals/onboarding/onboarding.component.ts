import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, HostListener } from '@angular/core';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '@services/storage.service';
import { ShellEvents } from '@enums/shell.enum';
import { CustomTranslateLoader } from '@utils/custom-translate-loader';
import { HttpClient } from '@angular/common/http';
import { Languages, LocalStorageKeys } from '@enums/global.enum';
import { CoreService } from '@services/core.service';
import { environment } from '@environments/environment';
import { PushService } from '@services/push.service';
import { UuidService } from '@services/uuid.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    FormsModule,
  ],
  providers: [
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
          deps: [HttpClient]
      }
    }).providers!
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent implements OnInit {
  @HostListener(`window:${ShellEvents.SHELL_PUSH_REQUEST_PERMISSION_RESPONSE}`, ['$event'])
  async handleShellPushRequestPermissionResponse(event: any) {
    await this.onPushRequestPermissionResponse(event.detail?.response || {});
  }

  @HostListener(`window:${ShellEvents.SHELL_PUSH_REGISTER_RESPONSE}`, ['$event'])
  async handleShellPushRegisterResponse(event: any) {
    await this.onPushRegisterResponse(event.detail?.response || {});
  }

  @HostListener(`window:${ShellEvents.SHELL_SCANNER_REQUEST_PERMISSION_RESPONSE}`, ['$event'])
  async handleShellScannerRequestPermissionResponse(event: any) {
    await this.onScannerRequestPermissionResponse(event.detail?.response || {});
  }

  public name = '';
  public step = 0;
  public currentLanguage = Languages.EN;
  public hasShell = false;
  public notificationPermission = '';
  public environment = environment;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly storageSrv: StorageService,
    private readonly coreSrv: CoreService,
    private translateSrv: TranslateService,
    private modalCtrl: ModalController,
  ) {
    this.translateSrv.setDefaultLang(this.storageSrv.getItem('language') || 'en');
    this.translateSrv.use(this.storageSrv.getItem('language') || 'en');
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.hasShell = this.coreSrv.hasShell();
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_PUSH_REQUEST_PERMISSION));
    this.cdr.detectChanges();
  }

  public increaseStep(): void {
    this.step++;
  }

  public changeLanguage(lang: string): void {
    this.storageSrv.setItem(LocalStorageKeys.LANGUAGE, lang);
    this.translateSrv.use(lang);
    this.increaseStep();
    this.cdr.detectChanges();
    if (!this.hasShell) {
      this.closeModal();
    }
  }

  public requestNotificationPermission(): void {
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_PUSH_REGISTER));
  }

  public requestCameraPermission(): void {
    window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_SCANNER_REQUEST_PERMISSION));
  }

  private onPushRequestPermissionResponse(response: any): void {
    this.notificationPermission = response.receive;
    this.cdr.detectChanges();
  }

  private onPushRegisterResponse(response: any): void {
    this.increaseStep();
  }

  private async onScannerRequestPermissionResponse(response: any): Promise<void> {
    await this.closeModal();
  }

  private async closeModal(): Promise<boolean> {
    this.storageSrv.setItem(LocalStorageKeys.ONBOARDING, 'true');
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }
}
