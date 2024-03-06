import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setItem(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  getItem(key: string) {
    try {
      return JSON.parse(localStorage.getItem(key) || '');
    } catch (error) {
      return localStorage.getItem(key);
    }
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
