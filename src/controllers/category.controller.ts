import type { Request, Response, NextFunction } from "express";
import type { CreateCategoryRequestBody } from "../types/category.type.js";
import { addCategory } from "../services/category.service.js";


export const handlerCreateCategory = async (req: Request<{}, {}, CreateCategoryRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { category_name, parent_name } = req.body;

    try {
        const result = await addCategory(category_name, parent_name);

        res.jsonSuccess(result, '카테고리 생성에 성공했습니다.', 201);
    }
    catch (error) {
        next(error);
    }
}   
