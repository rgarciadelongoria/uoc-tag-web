import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, retry, throwError } from 'rxjs';
import { LocalStorageKeys } from '@enums/global.enum';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ShellActions } from '../enums/shell.enum';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(
    private readonly storageSrv: StorageService,
  ) {}

  public hasShell(): boolean {
    const remoteVersion = '0.0.0';
    const shellVersion = this.storageSrv.getItem(ShellActions.SHELL_VERSION);
    if (shellVersion === remoteVersion) {
      return true;
    }
    return false;
  }
}