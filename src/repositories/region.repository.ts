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
            where: { region_code: region_code }
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

export const findOrCreateRegionByAddress = async (address: string, client: DBClient = prisma) => {
    try {
        // 주소가 없으면 에러
        if (!address || typeof address !== 'string') {
            throw new CustomError(400, ErrorCodes.INVALID_INPUT, '유효한 주소를 입력해주세요.');
        }

        // 주소 파싱: "서울특별시 성북구 삼선동" -> sido, sigungu, eubmyeonli
        const parts = address.trim().split(/\s+/);
        const sido = parts[0] || null;
        const sigungu = parts[1] || null;
        const eubmyeonli = parts[2] || null;

        // 동일한 주소가 이미 있는지 확인
        const existing = await client.region.findFirst({
            where: {
                sido: sido,
                sigungu: sigungu,
                eubmyeonli: eubmyeonli
            }
        });

        if (existing) {
            return existing;
        }

        // 없으면 새로 생성
        return await client.region.create({
            data: {
                sido: sido,
                sigungu: sigungu,
                eubmyeonli: eubmyeonli,
                region_code: null // region_code는 null로 설정
            }
        });
    } catch (error) {
        console.error(error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 조회/생성시 db 오류가 발생했습니다.');
    }
}