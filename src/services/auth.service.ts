import type { SignupRequestBody } from "../types/auth.types.js";
import { findUserByEmail, findUserById, updateUser } from "../repositories/auth.repository.js";
import { createUser, createUserLocalAccount } from "../repositories/auth.repository.js";
import * as bcrypt from 'bcrypt';
import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { findRegionByCode } from "../repositories/region.repository.js";

// 하드코딩: 주소를 지역코드로 변환
const convertAddressToRegionCode = (address: string): string => {
    // 입력값 정규화 (공백 제거, 소문자 변환)
    const normalized = address.replace(/\s+/g, '').toLowerCase();
    
    // 서울특별시 성북구 삼선동의 다양한 표현 지원
    const samseondongPatterns = [
        '서울특별시성북구삼선동',
        '서울성북구삼선동',
        '성북구삼선동',
        '삼선동'
    ];
    
    if (samseondongPatterns.some(pattern => normalized.includes(pattern.toLowerCase()))) {
        console.log(`주소 "${address}" -> 지역코드 1129010700 변환`);
        return '1129010700';
    }
    
    console.log(`주소 "${address}"는 변환되지 않음 (그대로 반환)`);
    return address; // 주소가 아니면 그대로 반환 (지역코드로 간주)
};

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
    
    // 주소를 지역코드로 변환 (하드코딩)
    const regionCode = convertAddressToRegionCode(userData.region_code);
    
    const region = await findRegionByCode(regionCode);
    if(!region) {
        throw new CustomError(400, ErrorCodes.RESOURCE_NOT_FOUND, '유효하지 않은 지역 코드입니다.');
    }
    const newUser = await prisma.$transaction(async (tx) => {
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
    
    // region_code가 제공되면 지역 조회
    if (region_code) {
        const convertedRegionCode = convertAddressToRegionCode(region_code);
        const region = await findRegionByCode(convertedRegionCode);
        
        if (!region) {
            throw new CustomError(400, ErrorCodes.RESOURCE_NOT_FOUND, '유효하지 않은 지역 코드입니다.');
        }
        
        region_id = region.id;
    }

    const updatedUser = await updateUser(userId, username, phone_num, address_detail, region_id);
    return updatedUser;
}


