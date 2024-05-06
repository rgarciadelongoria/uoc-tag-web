import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonTabs } from '@ionic/angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnboardingComponent } from '@modals/onboarding/onboarding.component';
import { StorageService } from '@services/storage.service';
import { Languages, LocalStorageKeys, Tabs } from '@enums/global.enum';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    TranslateModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  @ViewChild('mainTabs') mainTabs!: IonTabs;

  public tabs = Tabs;
  public activeTabName: Tabs = Tabs.GAMES;
  
  private hasOnboarding = false;

  constructor(
    private readonly router: Router,
    private readonly storageSrv: StorageService,
    private translateSrv: TranslateService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    this.hasOnboarding = this.storageSrv.getItem(LocalStorageKeys.ONBOARDING);
    if (!this.hasOnboarding) {
      await this.openOnboardingModal();
      this.mainTabs.select(Tabs.GAMES);
    } else {
      setTimeout(() => {
        this.mainTabs.select(Tabs.GAMES);
      }, 500);
    }
  }

  async openOnboardingModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: OnboardingComponent,
    });
    modal.present();

    await modal.onWillDismiss();

    const language = this.storageSrv.getItem(LocalStorageKeys.LANGUAGE) || Languages.EN;
    this.translateSrv.use(language);

    this.storageSrv.setItem(LocalStorageKeys.ONBOARDING, true);
  }

  public saveTabNavigation(tabName: Tabs): void {
    this.activeTabName = tabName;
    const tabNavigation = this.storageSrv.getItem(LocalStorageKeys.TAB_NAVIGATION) || [];
    tabNavigation.unshift(tabName);
    tabNavigation.length = 10;
    this.storageSrv.setItem(LocalStorageKeys.TAB_NAVIGATION, JSON.stringify(tabNavigation));
  }

  public clickScanButton(): void {
    this.saveTabNavigation(Tabs.SCAN); {
      this.mainTabs.select(Tabs.SCAN);
    }
  }

  public clickMenuButton(): void {
    this.saveTabNavigation(Tabs.MENU); {
      this.mainTabs.select(Tabs.MENU);
    }
  }

  public clickCloseScanButton(): void {
    // const latestTabNavigation = this.storageSrv.getItem(LocalStorageKeys.TAB_NAVIGATION)[1];
    this.saveTabNavigation(Tabs.GAMES); {
      this.mainTabs.select(Tabs.GAMES);
    }
  }
}
