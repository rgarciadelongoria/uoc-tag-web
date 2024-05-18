import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CategoryPr, GameData, PrizePr } from '@interfaces/game.interface';
import { environment } from '@environments/environment';
import { GameCodes } from '@enums/global.enum';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';

const COMBINATION_LENGTH = 6;

@Component({
  selector: 'app-game-pr',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    CustomCurrencyPipe,
    IonicModule,
    TranslateModule
  ],
  templateUrl: './game-pr.component.html',
  styleUrl: './game-pr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePrComponent implements OnInit {
  @Input() public data!: GameData;

  public environment = environment;
  public gameCodes = GameCodes;
  public prizes: PrizePr[] = [] as PrizePr[];
  public combination: string[] = [];
  public complementary: string = '';
  public refund: string = '';
  public jokerCombination: string = '';
  public bestCategory: CategoryPr = {} as CategoryPr;
  public jokerBestCategory: CategoryPr = {} as CategoryPr;

  ngOnInit(): void {
    this.prizes = this.data.data.info.prizes as PrizePr[];
    this.setMainData();
    this.setBestCategories();
  }

  private setMainData(): void {
    this.combination = this.prizes[0].combination.match(/\d+|C\(\d+\)|R\(\d+\)/g) || [];
    this.complementary = this.prizes[0].combination.match(/C\(\d+\)/g)?.[0] || '';
    this.refund = this.prizes[0].combination.match(/R\(\d+\)/g)?.[0] || '';
    this.combination.length = COMBINATION_LENGTH;
    this.jokerCombination = this.prizes[0].jokerCombination || '';
  }
  
  private setBestCategories(): void {
    this.bestCategory = this.prizes[0].categories.filter(item => item.winners > 0)[0];
    this.jokerBestCategory = this.prizes[0].categoriesJoker.filter(item => item.winners > 0)[0];
    // this.bestCategory = this.prizes[0].categories.reduce((min, current) => (min.winners > 0 && (current.winners < min.winners)) ? current : min, this.prizes[0].categories[0]);
    // this.bestCategory = this.prizes[0].categories
    // .filter(item => item.winners > 0)
    // .reduce((min, current) => {
    //   const currentWinners = current.winners;
    //   const minWinners = min.winners;
    //   if (currentWinners < minWinners) {
    //       return current;
    //   }
    //   return min;
    // }, this.prizes[0].categories[0]);
    // this.jokerBestCategory = this.prizes[0].categoriesJoker.reduce((min, current) => (min.winners > 0 && (current.winners < min.winners)) ? current : min, this.prizes[0].categoriesJoker[0]);
    // this.jokerBestCategory = this.prizes[0].categoriesJoker
    // .filter(item => item.winners > 0)
    // .reduce((min, current) => {
    //   const currentWinners = current.winners;
    //   const minWinners = min.winners;
    //   if (currentWinners < minWinners) {
    //       return current;
    //   }
    //   return min;
    // }, this.prizes[0].categoriesJoker[0]);
  }
}
