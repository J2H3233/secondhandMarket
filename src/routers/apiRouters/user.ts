import { Router } from 'express';

const router : Router = Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - User
 *     summary: 사용자 정보 조회 (예시)
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
// 예시 엔드포인트 (현재 구현되지 않음)
// router.get('/', (req, res) => {
//     res.send('User info');
// });

export default router;
