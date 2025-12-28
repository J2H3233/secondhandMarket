import type { SignupRequestBody } from "../types/auth.types.js";
import { findUserByEmail, findUserById, updateUser } from "../repositories/auth.repository.js";
import { createUser, createUserLocalAccount } from "../repositories/auth.repository.js";
import * as bcrypt from 'bcrypt';
import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { findOrCreateRegionByAddress } from "../repositories/region.repository.js";

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

    const newUser = await prisma.$transaction(async (tx) => {
        // 주소로 지역 찾기 또는 생성
        const region = await findOrCreateRegionByAddress(userData.region_code, tx);
        
        const createdUser = await createUser(userData.username, userData.phone_num, region.id, userData.address_detail, tx);
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

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
        where: { id: userAccount.user_id },
        select: { id: true, username: true }
    });

    if(!user) {
        throw new CustomError(404, ErrorCodes.RESOURCE_NOT_FOUND, '사용자 정보를 찾을 수 없습니다.');
    }

    return { 
        userId: userAccount.user_id,
        userName: user.username
    };
}

export const getUserInfo = async (userId: number) => {
    const user = await findUserById(userId);
    if (!user) {
        throw new CustomError(404, ErrorCodes.RESOURCE_NOT_FOUND, '사용자를 찾을 수 없습니다.');
    }
    return user;
}

export const updateUserInfo = async (
    userId: number,
    username: string,
    phone_num: string,
    address_detail: string,
    region_code?: string
) => {
    if (!username || !phone_num) {
        throw new CustomError(400, ErrorCodes.INVALID_INPUT, '필수 항목이 누락되었습니다.');
    }

    const user = await findUserById(userId);
    if (!user) {
        throw new CustomError(404, ErrorCodes.RESOURCE_NOT_FOUND, '사용자를 찾을 수 없습니다.');
    }

    let region_id: number | undefined = undefined;
    
    // region_code가 제공되면 지역 조회 또는 생성
    if (region_code) {
        const region = await findOrCreateRegionByAddress(region_code);
        region_id = region.id;
    }

    const updatedUser = await updateUser(userId, username, phone_num, address_detail, region_id);
    return updatedUser;
}


