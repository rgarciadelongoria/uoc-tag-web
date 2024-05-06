import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GameData } from '@interfaces/game.interface';
import { environment } from '@environments/environment';
import { GameCodes } from '@enums/global.enum';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LnService } from '@services/ln.service';
import { LnBestGames } from '@interfaces/ln.interface';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';

@Component({
  selector: 'app-game-ln',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    CustomCurrencyPipe,
    IonicModule,
    TranslateModule
  ],
  templateUrl: './game-ln.component.html',
  styleUrl: './game-ln.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameLnComponent {
  @Input() public data!: GameData;

  public environment = environment;
  public gameCodes = GameCodes;
  public bestGamePrizes: LnBestGames = {} as LnBestGames;

  constructor(
    private readonly lnSrv: LnService
  ) {}

  ngOnChanges(): void {
    this.getBestPrizes();
  }

  private getBestPrizes(): void {
    this.bestGamePrizes = this.lnSrv.getBestPrizes(this.data.data.info.raw);
  }
}
