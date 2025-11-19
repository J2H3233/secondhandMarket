import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';

export const findCategoryByName = async (name: string, client: DBClient = prisma) => {
    
    try{
        return await client.category.findFirst({
            where: { category_name: name }
        });
    }
    catch(error){
        console.error(error);
        throw new CustomError(500, ErrorCodes.INTERNAL_SERVER_ERROR, '카테고리 조회 중 오류 발생');
    }
}

export const createCategory = async (name: string, parent_id: number | null, client: DBClient = prisma) => {
    try{
        return await client.category.create({
            data: {
                category_name: name,
                parent_id : parent_id
            }
        });
    }
    catch(error){
        console.error(error);
        throw new CustomError(500, ErrorCodes.INTERNAL_SERVER_ERROR, '카테고리 생성 중 오류 발생');
    }
}
