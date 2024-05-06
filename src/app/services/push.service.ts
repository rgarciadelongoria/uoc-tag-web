import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Subject, Subscription, lastValueFrom } from 'rxjs';
import { ShellActions, ShellEvents } from '@enums/shell.enum';
import { PushData } from '@interfaces/push.interface';
import { LogKeys } from '@enums/global.enum';
import { ApiService } from '@services/api.service';
import { StorageService } from '@services/storage.service';
import { UserService } from '@services/user.service';
import { UserData } from '@interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class PushService implements OnDestroy {
  private apiPush = `${environment.api.host}${'/push'}`;
  private userSubscription: Subscription | undefined;

  constructor(
    private readonly apiSrv: ApiService,
    private readonly storageSrv: StorageService,
    private readonly userSrv: UserService
  ) {}

  public ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  public init(): void {
    if (!this.userSubscription) {
      this.userSubscription = this.userSrv.getUserSubject().subscribe(async user => {
        if (user._id) {
          const pushData: PushData | null = await this.getPushDataByToken();
          // If token exists and user is different, unregister token
          if (pushData?.user !== user._id) {
            await this.unregisterToken();
          }
          await this.registerToken(user);
        }
      });
    }
  }

  public getToken(): string {
    return this.storageSrv.getItem(ShellActions.SHELL_PUSH_TOKEN) || '';
  }

  private async registerToken(user: UserData): Promise<void> {
    if (user._id && this.getToken()) {
      const pushData: PushData | null = await this.getPushDataByToken();

      if (pushData?.user === user._id) {
        console.info(LogKeys.SYSTEM,`PUSH-TOKEN: ${this.getToken()} has already been registered.`);
      } else {
        const body = {
          token: this.getToken(),
          user: user._id
        };
  
        try {
          const pushData$ = this.apiSrv.post<PushData>(this.apiPush, body);
          const pushData = await lastValueFrom(pushData$);
          this.storageSrv.setItem(ShellActions.SHELL_PUSH_TOKEN, pushData.token);
          console.info(LogKeys.SYSTEM,`PUSH-TOKEN: ${this.getToken()} has been registered.`);
        } catch (error) {
          console.error(error);
        }
      } 
    }
  }

  private async getPushDataByToken(): Promise<PushData | null> {
    try {
      const pushData$ = this.apiSrv.get<PushData>(`${this.apiPush}/${this.getToken()}`);
      const pushData: PushData = await lastValueFrom(pushData$)
      return pushData;
    } catch (error) {
      return null;
    }
  };

  private async deletePushById(id: string): Promise<PushData | undefined> {
    try {
      const pushData$ = await this.apiSrv.delete<PushData>(`${this.apiPush}/${id}`);
      const pushData = await lastValueFrom(pushData$);
      return pushData;
    } catch (error) {
      throw error;
    }
  }

  private async deletePushByToken(token: string): Promise<PushData | undefined> {
    try {
      const pushData$ = await this.apiSrv.delete<PushData>(`${this.apiPush}/token/${token}`);
      const pushData = await lastValueFrom(pushData$);
      return pushData;
    } catch (error) {
      throw error;
    }
  }

  private async unregisterToken(): Promise<void> {
    if (this.getToken()) {
      try {
        const push: PushData | null = await this.getPushDataByToken();
        if (push) {
          await this.deletePushByToken(push.token);
          // this.storageSrv.removeItem(ShellActions.SHELL_PUSH_TOKEN);
          console.info(LogKeys.SYSTEM,`PUSH-TOKEN: ${this.getToken()} has been unregistered.`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
