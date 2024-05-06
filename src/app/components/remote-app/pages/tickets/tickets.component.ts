import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '@components/remote-app/components/header/header.component';
import { environment } from '@environments/environment';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { GameService } from '@services/game.service';
import { GameData, GameTicketPrizeData } from '@interfaces/game.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TicketLnComponent } from '@components/remote-app/components/ticket-ln/ticket-ln.component';
import { TicketData } from '@interfaces/ticket.interface';
import { LoadingComponent } from '@components/remote-app/components/loading/loading.component';
import { GameCodes, LocalStorageKeys, Tabs } from '@enums/global.enum';
import { StorageService } from '@services/storage.service';

const OFFSET_INCREASE = 5;
const LIMIT = 5;

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HeaderComponent,
    CustomDatePipe,
    TranslateModule,
    TicketLnComponent,
    LoadingComponent
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsComponent {
  public tickets: GameTicketPrizeData[] = [];
  public environment = environment;
  public gamesCodes = GameCodes;
  public showLoadMore = true;
  public skeletons: number[] = Array(LIMIT).fill(0);
  public noTicketsLoaded = false;
  public showLoadMoreSpinner = false;

  private limit = LIMIT;
  private offset = 0;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly gameSrv: GameService,
    private readonly storageSrv: StorageService,
  ) {}

  async ionViewDidEnter(): Promise<void> {
    this.limit = LIMIT;
    const reloadTickets = this.storageSrv.getItem(LocalStorageKeys.RELOAD_TICKETS);
    const lastTabNavigation = this.storageSrv.getItem(LocalStorageKeys.TAB_NAVIGATION) || [];
    if (!this.tickets.length ||
      (lastTabNavigation[1] === Tabs.SCAN) ||
      (reloadTickets)
    ) {
      this.offset = 0;
      await this.getUserTickets();
      if (this.tickets.length) {
        this.sortTicketsByDate();
      } else {
        this.noTicketsLoaded = true;
      }
    }
    this.cdr.detectChanges();
  }

  public async handleRefresh(event: any): Promise<void>{
    this.offset = 0;
    await this.getUserTickets();
    event.target.complete();
  }

  public sortTicketsByDate(): void {
    this.tickets.sort((a, b) => {
      const dateA = new Date(a.ticket.date!);
      const dateB = new Date(b.ticket.date!);
      return dateB.getTime() - dateA.getTime();
    });

    this.cdr.detectChanges();
  }

  public async deleteTicketById(ticket: TicketData): Promise<void> {
    if (ticket) {
      this.offset = 0;
      await this.getUserTickets();
    }
  }

  public openGame(game: GameData): void {
    this.gameSrv.openGame(game);
  }

  public async loadMore(): Promise<void> {
    this.showLoadMoreSpinner = true;
    this.offset += OFFSET_INCREASE;
    await this.getUserTickets();
    this.showLoadMoreSpinner = false;
    this.cdr.detectChanges();
  }

  private async getUserTickets(): Promise<void> {
    this.showLoadMore = true;
    this.storageSrv.setItem(LocalStorageKeys.RELOAD_TICKETS, false);
    try {
      const tickets = await this.gameSrv.getAllTicketsPrizesByUser(this.limit, this.offset);
      if (this.offset === 0) {
        this.tickets = tickets;
      } else {
        this.tickets = this.tickets.concat(tickets);
      }
      if (tickets.length < this.limit) {
        this.showLoadMore = false;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.log('Error getting tickets by user', error);
    }
  }
}
