import { GameCodes } from "../enums/global.enum";
import { TicketData } from "./ticket.interface";

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
    prizes:  Prize[];
    gameId?: string;
}

export interface Prize {
    number:   string;
    quantity: number;
}

export interface GameTicketPrizeData {
    ticket: TicketData;
    game:   GameData;
    prize:  Prize;
}