import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { GameTicketPrizeData, PrizeLn } from '@interfaces/game.interface';
import { environment } from '@environments/environment';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '@services/ticket.service';
import { TicketData } from '@interfaces/ticket.interface';
import { AlertCodes, GameCodes } from '@enums/global.enum';
import { TranslateModule } from '@ngx-translate/core';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-ticket-ln',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    CustomCurrencyPipe,
    IonicModule,
    TranslateModule
  ],
  templateUrl: './ticket-ln.component.html',
  styleUrl: './ticket-ln.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketLnComponent {
  @Input() public data!: GameTicketPrizeData;
  @Input() public skeleton = false;
  @Input() public showActions = true;

  @Output() deleteTicketEvent = new EventEmitter<TicketData>();

  public environment = environment;
  public gameCodes = GameCodes;
  public prize: PrizeLn = {} as PrizeLn;
  public showSearchLoading = false;

  constructor(
    private readonly ticketSrv: TicketService,
    private readonly gameSrv: GameService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getPrize();
  }

  public async deleteTicketById(id: string): Promise<void> {
    const role = await this.ticketSrv.presentAlertConfirmDeleteTicket();
    if (role === AlertCodes.ACCEPT) {
      this.skeleton = true;
      const response = await this.ticketSrv.deleteTicketById(id);
      if (response) {
        this.deleteTicketEvent.emit(response)
      }
    }
  }

  private async getPrize(): Promise<void> {
    this.showSearchLoading = true;
    const number = this.data?.ticket?.data?.info?.number || '';
    const gameId = this.data?.game?.data?.info?.gameId || '';
    if (number && gameId) {
      try {
        const prizes: PrizeLn[] = await this.gameSrv.checkPrizeByNumberLN(gameId || '', number);
        this.prize = prizes[0] || {} as PrizeLn;
      } catch (error) {
        console.error(error);
        this.prize = {} as PrizeLn;
      }
    } else {
      this.prize = {} as PrizeLn;
    }
    this.showSearchLoading = false;
    this.cdr.detectChanges();
  }
}
