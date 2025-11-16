import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';
import { findCategoryByName, createCategory } from '../repositories/category.repository.js';


export const addCategory = async (category_name: string, parent_name: string | null) => {

    let parent_id: number | null = null;

    if (parent_name !== null) {
        parent_id = await (async () => {
            const parentCategory =  await findCategoryByName(parent_name);
            if (!parentCategory) {
                throw new CustomError(400, ErrorCodes.RESOURCE_NOT_FOUND, '부모 카테고리를 찾을 수 없습니다.');
            }
            return parentCategory.id;
        })();
    } 
    return await createCategory(category_name, parent_id);

}