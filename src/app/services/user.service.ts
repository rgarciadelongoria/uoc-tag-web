import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { UserData, LoginData } from '@interfaces/user.interface';
import { GlobalKeys, LocalStorageKeys, LogKeys } from '@enums/global.enum';
import { ApiService } from '@services/api.service';
import { StorageService } from '@services/storage.service';
import { TicketData } from '@interfaces/ticket.interface';
import { PushData } from '@interfaces/push.interface';

const TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 1.5; // 1.5 hours

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: UserData = {} as UserData;
  private apiUser = `${environment.api.host}${'/user'}`;
  private user$ = new BehaviorSubject<UserData>({} as UserData);

  constructor(
    private readonly apiSrv: ApiService,
    private readonly storageSrv: StorageService,
  ) {}

  public getUser(): UserData {
    return this.user;
  }

  public getUserSubject(): BehaviorSubject<UserData> {
    return this.user$;
  }

  private setUser(user: UserData): void {
    this.user = user;
    this.user$.next(user);
  }

  async createUserByUuid(uuid: string): Promise<UserData> {
    const body = {
      email: `${uuid}${GlobalKeys.UUID_EMAIL_DOMAIN}`,
      password: uuid,
      name: uuid
    };

    try {
      const userData$ = this.apiSrv.post<UserData>(this.apiUser, body);
      const userData = await lastValueFrom(userData$);
      return userData;
    } catch (error) {
      throw error;
    }
  }

  public async loginByUuid(uuid: string): Promise<LoginData> {
    this.storageSrv.setItem(LocalStorageKeys.RELOAD_TICKETS, true);
    const loginData = await this.login(`${uuid}${GlobalKeys.UUID_EMAIL_DOMAIN}`, uuid);
    this.setUser(loginData.user);
    return loginData;
  }

  public async login(email: string, password: string): Promise<LoginData> {
    const body = {
      email,
      password
    };

    try {
      const loginData$ = this.apiSrv.post<LoginData>(`${this.apiUser}/login`, body);
      const loginData = await lastValueFrom(loginData$);
      if (loginData.token) {
        const tokenData = {
          token: loginData.token,
          date: Date.now()
        }
        this.storageSrv.setItem(LocalStorageKeys.TOKEN, JSON.stringify(tokenData));
        console.info(LogKeys.SYSTEM, `TOKEN: ${loginData.token}`);
      }
      return loginData;
    } catch (error) {
      throw error;
    }
  }

  public async checkTokenExpiration(uuid: string) {
    const currentTokenData = this.storageSrv.getItem(LocalStorageKeys.TOKEN);
    const currentTokenDate = currentTokenData?.date || 0;
    const currentDate = Date.now();
    if (currentDate - currentTokenDate > TOKEN_EXPIRATION_TIME) {
      await this.loginByUuid(uuid);
    }
  }

  public async getAllTicketsByUser(): Promise<TicketData[] | []> {
    try {
      const userTicketsData$ = this.apiSrv.get<TicketData[]>(`${this.apiUser}/ticket/all?limit=100&offset=0`);
      const userTicketsData: TicketData[] = await lastValueFrom(userTicketsData$)
      return userTicketsData;
    } catch (error) {
      return [];
    }
  };

  public async getAllPushesByUser(): Promise<PushData[] | []> {
    try {
      const userPushesData$ = this.apiSrv.get<PushData[]>(`${this.apiUser}/push/all?limit=100&offset=0`);
      const userPushesData: PushData[] = await lastValueFrom(userPushesData$)
      return userPushesData;
    } catch (error) {
      return [];
    }
  };
}
