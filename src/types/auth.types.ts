export interface SignupRequestBody {
    username: string;
    password: string;
    email: string;
    phone_num: string;
    region_code: string;
    address_detail?: string;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface SessionUserInfo {
    userId?: number;
    userName?: string;
}