export interface UserData {
    _id: string;
    email: string;
    name: string;
    roles: string[];
    isActive: boolean;
}

export interface LoginData {
    user: UserData;
    token: string;
}