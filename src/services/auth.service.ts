import type { SignupBody } from "../types/auth.types.js";
import { findUserByEmail } from "../repositories/auth.repository.js";
import * as bcrypt from 'bcrypt';

export const getLoginInfo = async (email: string) => {
    const user =  await findUserByEmail(email);
    return user;
}

export const verifyPassword = async (inputPassword: string, storedPassword: string) => {
    const match = await bcrypt.compare(inputPassword, storedPassword);
    return match;
}

export const signupUser = async (userData: SignupBody) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return { id: 1, email: userData.email, phone_num: userData.phone_num, region_code: userData.region_code }; // Placeholder return
}