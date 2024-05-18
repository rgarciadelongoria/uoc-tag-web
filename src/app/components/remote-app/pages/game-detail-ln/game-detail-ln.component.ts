import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GameData, PrizeLn } from '@interfaces/game.interface';
import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { environment } from '@environments/environment';
import { GameCodes } from '@enums/global.enum';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LnService } from '@services/ln.service';
import { GameLnComponent } from '@components/remote-app/components/game-ln/game-ln.component';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    CustomDatePipe,
    CustomCurrencyPipe,
    IonicModule,
    ScrollingModule,
    FormsModule,
    TranslateModule,
    GameLnComponent
  ],
  
  templateUrl: './game-detail-ln.component.html',
  styleUrl: './game-detail-ln.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailLnComponent{
  public debounce = 1000;
  public minSearchLength = 3;
  public environment = environment;
  public game: GameData = {} as GameData;
  public gameCodes = GameCodes;
  public results: PrizeLn[] = [];
  public searchValue = '';
  public showSearchLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly lnSrv: LnService,
    private readonly gameSrv: GameService
  ) {}

  ionViewDidEnter(): void {
    this.searchValue = '';
    this.game = history.state.game;
    this.searchValue = history.state.number || '';
    // this.formatPrizesNumbers();
    this.results = [];
    this.handleInput({ target: { value: this.searchValue } });
    this.cdr.detectChanges();
  }

  // Method to modify this.game.data.info.prizes to complete with X character for the left side to complete 5 characters
  // public formatPrizesNumbers(): void {
  //   const prizes = this.game.data.info.prizes as PrizeLn[];
  //   prizes.forEach((prize) => {
  //     prize.number = this.padStart(prize.number, 5, '?');
  //   });
  // }

  public async handleInput(event: any): Promise<void> {
    this.showSearchLoading = true;
    if (event.target.value.length && (event.target.value.length >= this.minSearchLength)) {
      try {
        const prizes: PrizeLn[] = await this.gameSrv.checkPrizeByNumberLN(this.game.data.info.gameId || '', event.target.value);
        this.results = prizes || [];
      } catch (error) {
        console.error(error);
        this.results = [];
      }
    } else {
      this.results = [];
    }
    console.log(this.results);
    this.showSearchLoading = false;
    this.cdr.detectChanges();
  }

  public clearSearch(): void {
    this.searchValue = '';
    this.results = [];
  }

  private padStart(text: string, targetLength: number, padString: string) {
    targetLength = targetLength >> 0; // truncate if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (text.length >= targetLength) {
      return String(text);
    } else {
      targetLength = targetLength - text.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(text);
    }
  }
}
