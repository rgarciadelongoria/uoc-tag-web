import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { HeaderComponent } from '@components/remote-app/components/header/header.component';
import { GameData } from '@interfaces/game.interface';
import { GameService } from '@services/game.service';
import { GameCodes, LocalStorageKeys } from '@enums/global.enum';
import { GameLnComponent } from '@components/remote-app/components/game-ln/game-ln.component';
import { LoadingComponent } from '@components/remote-app/components/loading/loading.component';
import { GamePrComponent } from '@components/remote-app/components/game-pr/game-pr.component';
import { StorageService } from '@services/storage.service';

// const OFFSET_INCREASE = 15;
const LIMIT = 10;
const NUM_GAMES = 2;
const DAYS_INCREASE = 15;

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HeaderComponent,
    CustomDatePipe,
    TranslateModule,
    GameLnComponent,
    GamePrComponent,
    LoadingComponent
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesComponent {
  public games: GameData[] = [];
  public gamesCodes = GameCodes;
  public showLoadMore = true;
  public skeletons: number[] = Array(LIMIT*NUM_GAMES).fill(0);
  public noGamesLoaded = false;
  public showLoadMoreSpinner = false;

  private limit = LIMIT;
  private offset = 0;
  private minDays = 0;
  private maxDays = this.minDays + DAYS_INCREASE;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly gameSrv: GameService,
    private readonly storageSrv: StorageService
  ) {}

  async ionViewDidEnter(): Promise<void> {
    this.limit = LIMIT;
    if (!this.games.length) {
      await this.loadGames();
    }
    this.cdr.detectChanges();
  }

  public async loadGames(): Promise<void> {

    this.showLoadMore = true;
    const LnGames = await this.getGamesByCodeOnlyWithPrizes(GameCodes.LOTERIA_NACIONAL);
    const PrGames = await this.getGamesByCodeOnlyWithPrizes(GameCodes.LA_PRIMITIVA);


    if (this.minDays === 0) {
      this.games = [];
    }
    const lastGamesCount = this.games.length;
    this.games = this.games.concat(LnGames, PrGames);
    if (this.games.length === lastGamesCount) {
      this.showLoadMore = false;
    }
    this.cdr.detectChanges();

    if (this.games.length) {
      this.sortGamesByDate();
    } else {
      this.noGamesLoaded = true;
    }
    this.cdr.detectChanges();
  }

  public openGame(game: GameData): void {
    this.gameSrv.openGame(game);
  }

  public async loadMore(): Promise<void> {;
    this.showLoadMoreSpinner = true;
    // this.offset += OFFSET_INCREASE;
    this.minDays += DAYS_INCREASE;
    this.maxDays = this.minDays + DAYS_INCREASE;
    await this.loadGames();
    this.showLoadMoreSpinner = false;
    this.cdr.detectChanges();
  }

  public async handleRefresh(event: any): Promise<void>{
    this.minDays = 0;
    this.maxDays = this.minDays + DAYS_INCREASE;
    await this.loadGames();
    event.target.complete();
  }

  private sortGamesByDate(): void {
    this.games.sort((a, b) => {
      const dateA = new Date(a.date!);
      const dateB = new Date(b.date!);
      return dateB.getTime() - dateA.getTime();
    });
  }

  private async getGamesByCodeOnlyWithPrizes(code: GameCodes): Promise<GameData[]> {
    let games: GameData[] = [];
    try {
      games = await this.gameSrv.getAllGamesByCodeOnlyWithPrizes(code, this.limit, this.offset, this.minDays, this.maxDays);
    } catch (error) {
      console.log('Error getting games by code', error);
    }
    return games;
  }
}
