import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { lastValueFrom } from 'rxjs';
import { ShellEvents } from '@enums/shell.enum';
import { UserService } from '@services/user.service';
import { UuidData } from '@interfaces/uuid.interface';
import { LocalStorageKeys, LogKeys } from '@enums/global.enum';
import { ApiService } from '@services/api.service';
import { CoreService } from '@services/core.service';
import { v4 as uuid } from 'uuid';
import { StorageService } from '@services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class UuidService {
  private uuid = '';
  private apiUuid = `${environment.api.host}${'/uuid'}`;

  constructor(
    private readonly apiSrv: ApiService,
    private readonly userSrv: UserService,
    private readonly coreSrv: CoreService,
    private readonly storageSrv: StorageService
  ) {
    window.addEventListener(ShellEvents.SHELL_DEVICE_GET_ID_RESPONSE, async (event: any) => {
      const localUuid = (localStorage.getItem(LocalStorageKeys.APP_UUID) || (event.detail?.response || ''));
      this.setAppUuid(localUuid);
      await this.onDeviceIdResponse();
    });
  }

  public async init(): Promise<void> {
    await this.requestDeviceId();
  }

  public getUuid(): string {
    return this.uuid;
  }

  public updateAppUuid(newUuid: string): void {
    this.setAppUuid(newUuid);
    this.setSyncMark();
  }

  private async requestDeviceId(): Promise<void> {
    if (this.coreSrv.hasShell()) {
      window.dispatchEvent(new CustomEvent(ShellEvents.SHELL_DEVICE_GET_ID));
    } else {
      const localUuid = (localStorage.getItem(LocalStorageKeys.APP_UUID) || '');
      this.setAppUuid(localUuid);
      await this.onDeviceIdResponse();
    }
  }

  private setAppUuid(newUuid: string): void {
    this.uuid = newUuid;
    if (!this.uuid) {
      this.uuid = uuid();
    }
    this.storageSrv.setItem(LocalStorageKeys.APP_UUID, this.uuid);
  }

  private setSyncMark(): void {
    this.storageSrv.setItem(LocalStorageKeys.APP_SYNC_MARK, new Date().toISOString());
  }

  private async onDeviceIdResponse(): Promise<void> {
    const uuidData = await this.getUuidData();
    if (!uuidData) {
      await this.registerUuid();
    } else {
      await this.userSrv.loginByUuid(this.uuid);
      console.info(LogKeys.SYSTEM,`UUID: ${this.uuid} was registered.`);
    }
  }

  public async getUuidData(): Promise<UuidData | null> {
    try {
      const uuidData$ = this.apiSrv.get<UuidData>(`${this.apiUuid}/${this.uuid}`);
      const uuidData: UuidData = await lastValueFrom(uuidData$)
      return uuidData;
    } catch (error) {
      return null;
    }
  };

  private async registerUuid(): Promise<void> {
    const userData = await this.userSrv.createUserByUuid(this.uuid)
    const loginData = await this.userSrv.loginByUuid(this.uuid);
    
    if (loginData.token) {
      const body = {
        uuid: this.uuid,
        user: userData._id
      };

      try {
        const uuidData$ = this.apiSrv.post<UuidData>(this.apiUuid, body);
        const uuidData = await lastValueFrom(uuidData$);
        this.uuid = uuidData.uuid;
        console.info(LogKeys.SYSTEM,`UUID: ${this.uuid} has been registered.`);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
