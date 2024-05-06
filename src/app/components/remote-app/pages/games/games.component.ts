import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { HeaderComponent } from '@components/remote-app/components/header/header.component';
import { GameData } from '@interfaces/game.interface';
import { GameService } from '@services/game.service';
import { GameCodes } from '@enums/global.enum';
import { GameLnComponent } from '@components/remote-app/components/game-ln/game-ln.component';
import { LoadingComponent } from '@components/remote-app/components/loading/loading.component';

const OFFSET_INCREASE = 10;
const LIMIT = 10;

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
  public skeletons: number[] = Array(LIMIT).fill(0);
  public noGamesLoaded = false;
  public showLoadMoreSpinner = false;

  private limit = LIMIT;
  private offset = 0;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly gameSrv: GameService,
    private readonly router: Router
  ) {}

  async ionViewDidEnter(): Promise<void> {
    this.limit = LIMIT;
    if (!this.games.length) {
      await this.loadGames();
      if (this.games.length) {
        this.sortGamesByDate();
      } else {
        this.noGamesLoaded = true;
      }
    }
    this.cdr.detectChanges();
  }

  public async loadGames(): Promise<void> {
    this.showLoadMore = true;
    return await this.getGamesByCodeOnlyWithPrizes(GameCodes.LOTERIA_NACIONAL);
  }

  public openGame(game: GameData): void {
    this.gameSrv.openGame(game);
  }

  public async loadMore(): Promise<void> {;
    this.showLoadMoreSpinner = true;
    this.offset += OFFSET_INCREASE;
    await this.loadGames();
    this.showLoadMoreSpinner = false;
    this.cdr.detectChanges();
  }

  public async handleRefresh(event: any): Promise<void>{
    this.offset = 0;
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

  private async getGamesByCodeOnlyWithPrizes(code: GameCodes): Promise<void> {
    try {
      const games = await this.gameSrv.getAllGamesByCodeOnlyWithPrizes(code, this.limit, this.offset);
      if (this.offset === 0) {
        this.games = [];
      }
      this.games = this.games.concat(games);
      if (games.length < this.limit) {
        this.showLoadMore = false;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.log('Error getting games by code', error);
    }
  }
}
