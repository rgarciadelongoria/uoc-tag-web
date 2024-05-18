import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GameData, PrizeLn } from '@interfaces/game.interface';
import { environment } from '@environments/environment';
import { GameCodes } from '@enums/global.enum';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LnService } from '@services/ln.service';
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
  public primerPremio: PrizeLn = {} as PrizeLn;
  public segundoPremio: PrizeLn = {} as PrizeLn;
  public primerReintegro: PrizeLn = {} as PrizeLn;
  public segundoReintegro: PrizeLn = {} as PrizeLn;
  public tercerReintegro: PrizeLn = {} as PrizeLn;

  constructor(
    private readonly lnSrv: LnService
  ) {}

  ngOnChanges(): void {
    this.getBestPrizes();
  }

  private getBestPrizes(): void {
    this.primerPremio = this.data.data.info.prizes[0] as PrizeLn;
    this.segundoPremio = this.data.data.info.prizes[1] as PrizeLn;
    this.primerReintegro = this.data.data.info.prizes[2] as PrizeLn;
    this.segundoReintegro = this.data.data.info.prizes[3] as PrizeLn;
    this.tercerReintegro = this.data.data.info.prizes[4] as PrizeLn;
  }
}
