import { prisma } from '../config/db.config.js';
import type { DBClient } from '../types/db.types.js';

export const findRegionById = async (id: number, client: DBClient = prisma) => {
    return await client.region.findUnique({
        where: { id: id }
    });
}

export const createRegion = async (sido: string, sigungu: string, eubmyeonli: string, region_code: string, client: DBClient = prisma) => {
    return await client.region.create({
        data: {
            sido: sido,
            sigungu: sigungu,
            eubmyeonli: eubmyeonli,
            region_code: region_code
        }
    });
}

export const findRegionByCode = async (region_code: string, client: DBClient = prisma) => {
    return await client.region.findUnique({
        where: { region_code: region_code }
    });
}