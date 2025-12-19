import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { handlerCreatePost, handlerGetPost, handlerSoftDeletePost, handlerGetPosts } from  '../../controllers/post.controller.js';
import upload  from '../../middlewares/multer.js';
import { updatePostService } from '../../services/post.service.js';
import { successResponse, errorResponse } from '../../middlewares/responseHandler.js';

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

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     tags:
 *       - Post
 *     summary: 게시글 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               price:
 *                 type: number
 *               delivery_charge:
 *                 type: number
 *               transaction_type:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 게시글 수정 성공
 */
router.put('/:id', checkLoggedIn as any, async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const userId = Number(req.session.userId);
        const { title, content, price, delivery_charge, transaction_type, category, status } = req.body;
        
        if (!title || !content || !price || !transaction_type) {
            return res.status(400).json(errorResponse('필수 항목이 누락되었습니다.', 400));
        }
        
        const updatedPost = await updatePostService(
            postId,
            userId,
            title,
            content,
            price,
            delivery_charge || 0,
            transaction_type,
            category,
            status
        );
        
        res.json(successResponse(updatedPost, '게시글이 수정되었습니다.'));
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/post:
 *   get:
 *     summary: 게시글 목록 조회 (페이징)
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 21
 *         description: 조회할 게시글 수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 건너뛸 게시글 수
 *     responses:
 *       '200':
 *         description: 게시글 목록 조회 성공
 */
router.get('/', handlerGetPosts as any);


export default router;