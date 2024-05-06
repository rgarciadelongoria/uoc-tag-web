import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GameData, Prize } from '@interfaces/game.interface';
import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { environment } from '@environments/environment';
import { GameCodes } from '@enums/global.enum';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LnBestGames } from '@interfaces/ln.interface';
import { LnService } from '@services/ln.service';
import { GameLnComponent } from '@components/remote-app/components/game-ln/game-ln.component';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
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
  public results: Prize[] = [];
  public searchValue = '';
  public bestGamePrizes: LnBestGames = {} as LnBestGames;
  public showSearchLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly lnSrv: LnService
  ) {}

  ionViewDidEnter(): void {
    this.searchValue = '';
    this.game = history.state.game;
    this.formatPrizesNumbers();
    this.results = this.game.data.info.prizes;
    this.cdr.detectChanges();
  }

  // Method to modify this.game.data.info.prizes to complete with X character for the left side to complete 5 characters
  public formatPrizesNumbers(): void {
    this.game.data.info.prizes.forEach((prize) => {
      prize.number = this.padStart(prize.number, 5, '?');
    });
  }

  public handleInput(event: any): void {
    // direct search
    this.searchValue = event.target.value.toLowerCase();
    this.results = this.game.data.info.prizes.filter((prize) => prize.number.toLowerCase().indexOf(this.searchValue) > -1);

    if (!this.results.length) {
      // special character search
      const specialCharacterPrizes = this.game.data.info.prizes.filter((prize) => prize.number.includes('?'));
      const moreResults = specialCharacterPrizes.filter((prize) => {
        const specialCharacters = prize.number.match(/\?/g) || [];
        const cleanPrizeNumber = prize.number.slice(specialCharacters.length);
        const cleanSearchValue = this.searchValue.slice(specialCharacters.length);
        return cleanPrizeNumber === cleanSearchValue;
      });

      this.results = Array.from(new Set([...this.results, ...moreResults]));
    }
    this.showSearchLoading = false;
  }

  public clearSearch(): void {
    this.searchValue = '';
    this.results = this.game.data.info.prizes;
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
