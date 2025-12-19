import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { createReviewService } from '../../services/review.service.js';
import { successResponse, errorResponse } from '../../middlewares/responseHandler.js';

const router: Router = Router();

/**
 * @swagger
 * /api/review:
 *   post:
 *     tags:
 *       - Review
 *     summary: 리뷰 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trade_record_id:
 *                 type: number
 *               post_id:
 *                 type: number
 *               rating:
 *                 type: number
 *               content:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 리뷰 작성 성공
 */
router.post('/', checkLoggedIn as any, async (req, res, next) => {
    try {
        const buyer_id = Number(req.session.userId);
        const { trade_record_id, post_id, rating, content } = req.body;
        
        if (!trade_record_id || !post_id || !rating) {
            return res.status(400).json(errorResponse('필수 항목이 누락되었습니다.', 400));
        }
        
        const review = await createReviewService(
            Number(trade_record_id),
            Number(post_id),
            buyer_id,
            Number(rating),
            content || ''
        );
        
        res.json(successResponse(review, '리뷰가 작성되었습니다.'));
    } catch (error) {
        next(error);
    }
});

export default router;
