import { prisma } from '../config/db.config.js';
import type { DBClient } from '../types/db.types.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';

export const findUserByEmail = async (email: string, client: DBClient = prisma) => {
    try{
        return await client.user_local_account.findUnique({
            where: { email: email }
    });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 이메일 조회시 db 오류가 발생했습니다.');
    }
}

export const createUserLocalAccount = async (email: string, passwordHash: string, userId: number, client: DBClient = prisma) => {
    try {
        return await client.user_local_account.create({
            data: {
                email: email,
                password_hash:  passwordHash,
                user : {
                    connect: { id: userId }
                }
            }
    });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 로컬 계정 생성시 db 오류가 발생했습니다.');
    }
}

export const createUser = async (username: string, phone_num: string, region_id: number, client: DBClient = prisma) => {
    try {
        return await client.user.create({
            data: {
                username: username,
                phone_num: phone_num,
                region : {
                    connect: { id: region_id }
                }
            }
    });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 생성시 db 오류가 발생했습니다.');
    }
};

