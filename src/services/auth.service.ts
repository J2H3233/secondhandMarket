import type { SignupRequestBody } from "../types/auth.types.js";
import { findUserByEmail } from "../repositories/auth.repository.js";
import { createUser, createUserLocalAccount } from "../repositories/auth.repository.js";
import * as bcrypt from 'bcrypt';
import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { findRegionByCode } from "../repositories/region.repository.js";

export const getLoginInfo = async (email: string) => {
    const user =  await findUserByEmail(email);
    return user;
}

export const verifyPassword = async (inputPassword: string, storedPassword: string) => {
    const match = await bcrypt.compare(inputPassword, storedPassword);
    return match;
}

export const signupUser = async (userData: SignupRequestBody) => {

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const existingUser = await findUserByEmail(userData.email);
    if(existingUser) {
        throw new CustomError(409, ErrorCodes.RESOURCE_ALREADY_EXISTS, '이미 존재하는 이메일입니다.');
    }
    const region = await findRegionByCode(userData.region_code);
    if(!region) {
        throw new CustomError(400, ErrorCodes.RESOURCE_NOT_FOUND, '유효하지 않은 지역 코드입니다.');
    }
    const newUser = await prisma.$transaction(async (tx) => {
        const createdUser = await createUser(userData.username, userData.phone_num, region.id, tx);
        await createUserLocalAccount(userData.email, hashedPassword, createdUser.id, tx);
        return createdUser;
    });

    return newUser;
}

export const loginUser = async (loginData: { email: string; password: string; }): Promise<SessionUserInfo> => {
    const userAccount = await findUserByEmail(loginData.email);
    if(!userAccount) {
        throw new CustomError(404, ErrorCodes.RESOURCE_NOT_FOUND, '존재하지 않는 이메일입니다.');
    }
    const passwordMatch = await verifyPassword(loginData.password, userAccount.password_hash);
    if(!passwordMatch) {
        throw new CustomError(401, ErrorCodes.UNAUTHORIZED, '비밀번호가 일치하지 않습니다.');
    }

    return { userId: userAccount.user_id };
}


