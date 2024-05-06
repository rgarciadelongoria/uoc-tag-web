import { Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { TicketData } from '@interfaces/ticket.interface';
import { environment } from '@environments/environment';
import { lastValueFrom } from 'rxjs';
import { AlertCodes } from '../enums/global.enum';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiTicket = `${environment.api.host}${'/ticket'}`;

  constructor(
    private alertController: AlertController,
    private translateSrv: TranslateService,
    private readonly apiSrv: ApiService,
  ) {}

  public async createNewTicket(code: string): Promise<TicketData> {
    const body: TicketData = {
      data: {
        info: {
          code
        }
      }
    };

    try {
      const ticketData$ = await this.apiSrv.post<TicketData>(this.apiTicket, body);
      const ticketData = await lastValueFrom(ticketData$);
      return ticketData;
    } catch (error) {
      throw error;
    }
  }

  public async deleteTicketById(id: string): Promise<TicketData | undefined> {
    try {
      const ticketData$ = await this.apiSrv.delete<TicketData>(`${this.apiTicket}/${id}`);
      const ticketData = await lastValueFrom(ticketData$);
      return ticketData;
    } catch (error) {
      throw error;
    }
  }

  public async presentAlertConfirmDeleteTicket(): Promise<AlertCodes> {
    const alert = await this.alertController.create({
      header: this.translateSrv.instant('TICKETS.DELETE_TICKET'),
      subHeader: this.translateSrv.instant('GLOBAL.IRREVERSIBLE_ACTION'),
      message: this.translateSrv.instant('TICKETS.DELETE_TICKET_QUESTION'),
      buttons: [
        {
          text: this.translateSrv.instant('GLOBAL.CANCEL'),
          role: AlertCodes.CANCEL,
          handler: () => {
            // Nothing to do
          },
        },
        {
          text: this.translateSrv.instant('GLOBAL.ACCEPT'),
          role: AlertCodes.ACCEPT,
          handler: () => {
            // Nothing to do
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role as AlertCodes;
  }
}
