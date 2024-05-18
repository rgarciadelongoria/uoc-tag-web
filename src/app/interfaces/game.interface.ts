import { GameCodes } from "../enums/global.enum";
import { TicketData } from "./ticket.interface";

/*
General
*/

export interface GameData {
    _id:  string;
    code: GameCodes;
    date: string;
    data: Data;
    __v:  number;
}

export interface Data {
    info: Info;
}

export interface Info {
    raw:     string;
    prizes:  PrizeLn[] | PrizePr[]; // All game prize types
    gameId?: string;
    completePrizesListRaw?: string;
}

export interface GameTicketPrizeData {
    ticket: TicketData;
    game:   GameData;
    prize:  PrizeLn | PrizePr; // All game prize types
}

/*
LN
*/

export interface PrizeLn {
    number:   string;
    quantity: number;
    prizeType: string;
}

/*
PR
*/

export interface PrizePr {
    combination: string;
    categories:  CategoryPr[];
    categoriesJoker: CategoryPr[];
    jackpot: number;
    bets: number;
    collection: number;
    prizesTotal: number;
    jackpotPool: number;
    jokerGameId: string;
    jokerAssociatedGameId: string;
    jokerJackpot: number;
    jokerCombination: string;
}

export interface CategoryPr {
    category: string;
    quantity: number;
    winners:  number;
}