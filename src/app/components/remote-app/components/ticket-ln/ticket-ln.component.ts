import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GameTicketPrizeData } from '@interfaces/game.interface';
import { environment } from '@environments/environment';
import { CustomDatePipe } from '@pipes/custom-date.pipe';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '@services/ticket.service';
import { TicketData } from '@interfaces/ticket.interface';
import { AlertCodes, GameCodes } from '@enums/global.enum';
import { TranslateModule } from '@ngx-translate/core';
import { CustomCurrencyPipe } from '@pipes/custom-currency.pipe';

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

  constructor(
    private readonly ticketSrv: TicketService
  ) {}

  ngOnInit(): void {}

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
}
