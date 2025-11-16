import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { handlerCreatePost, handlerGetPost, handlerSoftDeletePost } from  '../../controllers/post.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePostRequest:
 *       type: object
 *       required:
 *         - region_code
 *         - price
 *         - delivery_charge
 *         - transaction_type
 *         - content
 *         - title
 *       properties:
 *         region_code:
 *           type: string
 *           example: "9999999999"
 *         price:
 *           type: number
 *           example: 50000
 *         delivery_charge:
 *           type: number
 *           example: 3000
 *         transaction_type:
 *           type: string
 *           example: "IN_PERSON"
 *         content:
 *           type: string
 *           example: "상품 설명입니다"
 *         title:
 *           type: string
 *           example: "상품 제목입니다"
 * 
 */

/**
 * @swagger
 * /api/post:
 *   post:
 *     tags:
 *       - Post
 *     summary: 게시글 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.post('/', checkLoggedIn as any, handlerCreatePost as any);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     tags:
 *       - Post
 *     summary: 게시글 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.get('/:id', handlerGetPost as any);

/**
 * @swagger
 * /api/post/{id}:
 *   patch:
 *     tags:
 *       - Post
 *     summary: 게시글 삭제 (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.patch('/:id', checkLoggedIn as any, handlerSoftDeletePost as any);


export default router;