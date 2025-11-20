import type { Request, Response, NextFunction } from "express";
import type { CreateCategoryRequestBody } from "../types/category.type.js";
import { addCategory } from "../services/category.service.js";

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: 새 카테고리 생성
 *     description: 새로운 카테고리를 생성합니다. 부모 카테고리를 지정하여 하위 카테고리를 만들 수 있습니다.
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: 생성할 카테고리명
 *                 example: "전자기기"
 *               parent_name:
 *                 type: string
 *                 description: 부모 카테고리명 (선택사항)
 *                 example: "중고용품"
 *     responses:
 *       201:
 *         description: 카테고리 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "카테고리 생성에 성공했습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     category_name:
 *                       type: string
 *                       example: "전자기기"
 *                     parent_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-20T10:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-20T10:30:00.000Z"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "카테고리명은 필수입니다."
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "카테고리 생성 중 오류가 발생했습니다."
 */
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

