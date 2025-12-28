import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import { updateUserInfo } from '../../services/auth.service.js';
import { successResponse, errorResponse } from '../../middlewares/responseHandler.js';

const router : Router = Router();

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     tags:
 *       - User
 *     summary: 사용자 정보 수정
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone_num:
 *                 type: string
 *               address_detail:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 정보 수정 성공
 */
router.put('/update', checkLoggedIn as any, async (req, res, next) => {
    try {
        const userId = Number(req.session.userId);
        const { username, phone_num, address_detail, region_code } = req.body;
        
        if (!username || !phone_num) {
            return res.status(400).json(errorResponse('이름과 전화번호는 필수입니다.', 400));
        }
        
        const updatedUser = await updateUserInfo(
            userId, 
            username, 
            phone_num, 
            address_detail || '',
            region_code
        );
        
        // 세션 업데이트
        req.session.userName = username;
        
        res.json(successResponse(updatedUser, '사용자 정보가 수정되었습니다.'));
    } catch (error) {
        next(error);
    }
});

export default router;
