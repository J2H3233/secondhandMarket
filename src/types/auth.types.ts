export interface SignupBody {
    username: string;
    password: string;
    email: string;
    phone_num: string;
    region_code: string;
}

export interface LoginBody {
    email: string;
    password: string;
}