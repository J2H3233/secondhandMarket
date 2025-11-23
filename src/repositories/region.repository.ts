import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';


export const findRegionById = async (id: number, client: DBClient = prisma) => {
    try {
        return await client.region.findUnique({
            where: { id: id }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 조회시 db 오류가 발생했습니다.');
    }
}

export const createRegion = async (sido: string, sigungu: string, eubmyeonli: string, region_code: string, client: DBClient = prisma) => {
    
    try {
        return await client.region.create({
            data: {
                sido: sido,
                sigungu: sigungu,
                eubmyeonli: eubmyeonli,
                region_code: region_code
            }
        });
    }catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 생성시 db 오류가 발생했습니다.');
    }
}

export const findRegionByCode = async (region_code: string, client: DBClient = prisma) => {
    try {
        return await client.region.findUnique({
            where: { region_code: '9999999999' }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 코드 조회시 db 오류가 발생했습니다.');
    }
}

export const existRegionByCode = async (region_code: string, client: DBClient = prisma) => {
    try {
        const region = await client.region.findUnique({
            where: { region_code: region_code },
            select: { id: true },
        });
        return region !== null;
    }
    catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 코드 존재 여부 조회시 db 오류가 발생했습니다.');
    }   
}