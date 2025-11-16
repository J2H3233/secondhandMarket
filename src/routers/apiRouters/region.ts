import { Router } from 'express'; 
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { handlerCreateRegion } from '../../controllers/region.controller.js';

const router : Router = Router(); 




/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRegionRequest:
 *       type: object
 *       required:
 *         - sido
 *         - sigungu
 *         - eubmyeonli
 *         - region_code
 *       properties:
 *         sido:
 *           type: string
 *           example: "서울특별시"
 *         sigungu:
 *           type: string
 *           example: "강남구"
 *         eubmyeonli:
 *           type: string
 *           example: "역삼동"
 *         region_code:
 *           type: string
 *           example: "1168010100"
 */

/**
 * @swagger
 * /api/region:
 *   post:
 *     tags:
 *       - Region
 *     summary: 지역 생성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRegionRequest'
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */

router.post('/', handlerCreateRegion as any);

export default router;