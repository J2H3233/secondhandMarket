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

export const createUser = async (username: string, phone_num: string, region_id: number, address_detail?: string, client: DBClient = prisma) => {
    try {
        const userData: any = {
            username: 'test2',
            phone_num: '0101111234',
            region: {
                connect: { id: region_id }
            }
        };

        // address_detail이 있을 때만 객체에 추가
        if (address_detail !== undefined) {
            userData.address_detail = address_detail;
        }

        return await client.user.create({
            data: userData
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 생성시 db 오류가 발생했습니다.');
    }
};

export const findUserById = async (id: number, client: DBClient = prisma) => {
    try {
        return await client.user.findUnique({
            where: { id: id },
            include: {
                region: true,
                user_local_account: {
                    select: {
                        email: true
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 조회시 db 오류가 발생했습니다.');
    }
};

export const updateUser = async (
    userId: number,
    username: string,
    phone_num: string,
    address_detail: string,
    region_id?: number,
    client: DBClient = prisma
) => {
    try {
        const updateData: any = {
            username: username,
            phone_num: phone_num,
            address_detail: address_detail
        };
        
        // region_id가 제공되면 업데이트
        if (region_id !== undefined) {
            updateData.region = {
                connect: { id: region_id }
            };
        }
        
        return await client.user.update({
            where: { id: userId },
            data: updateData
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 정보 업데이트시 db 오류가 발생했습니다.');
    }
};

