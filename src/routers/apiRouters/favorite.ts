import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { handleToggleFavorite, handleGetFavorites, handleGetFavoriteStatus } from '../../controllers/favorite.controller.js';

const router = Router();

/**
 * @swagger
 * /api/favorite/toggle/{postId}:
 *   post:
 *     summary: 찜하기/찜 취소 토글
 *     tags: [Favorite]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 찜 토글 성공
 */
router.post('/toggle/:postId', checkLoggedIn as any, handleToggleFavorite as any);

/**
 * @swagger
 * /api/favorite/list:
 *   get:
 *     summary: 사용자의 찜 목록 조회
 *     tags: [Favorite]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 조회할 찜 개수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 건너뛸 찜 개수
 *     responses:
 *       200:
 *         description: 찜 목록 조회 성공
 */
router.get('/list', checkLoggedIn as any, handleGetFavorites as any);

/**
 * @swagger
 * /api/favorite/status/{postId}:
 *   get:
 *     summary: 게시글의 찜 상태 조회
 *     tags: [Favorite]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 찜 상태 조회 성공
 */
router.get('/status/:postId', handleGetFavoriteStatus as any);

export default router;
