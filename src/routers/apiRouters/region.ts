import { Router } from 'express'; 
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { handlerCreateRegion } from '../../controllers/region.controller.js';

const router : Router = Router(); 




/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the region
 *         name:
 *           type: string
 *           description: The name of the region
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update date
 */

/**
 * @swagger
 * /api/region:
 *   post:
 *     summary: Create a new region
 *     tags: [Region]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sido
 *               - sigungu
 *               - eubmyeonli
 *               - region_code
 *             properties:
 *               sido:
 *                 type: string
 *                 description: The name of the region
 *               sigungu:
 *                 type: string
 *                 description: The name of the sub-region
 *               eubmyeonli:
 *                 type: string
 *                 description: The name of the smaller administrative unit
 *               region_code:
 *                 type: string
 *                 description: The unique code for the region
 *             example:
 *               sido: "Seoul"
 *               sigungu: "Gangnam-gu"
 *               eubmyeonli: "Yeoksam-dong"
 *               region_code: "12345"
 *     responses:
 *       201:
 *         description: Region created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post('/', checkLoggedIn as any, handlerCreateRegion as any);

export default router;