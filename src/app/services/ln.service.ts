import { Injectable } from '@angular/core';
import { LnBestGames } from '@interfaces/ln.interface';

@Injectable({
providedIn: 'root'
})
export class LnService {
    constructor() { }

    public getBestPrizes(raw: string): LnBestGames {
        const rawJson: LnBestGames = JSON.parse(raw);
        return rawJson;
    }
}

