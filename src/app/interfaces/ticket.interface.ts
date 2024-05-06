export interface TicketData {
    _id?: string;
    code?: string;
    date?: string;
    user?: string;
    data: TicketDataData;
}

export interface TicketDataData {
    info: TicketDataDataInfo;
}
export interface TicketDataDataInfo {
    number?: string;
    code: string;
}