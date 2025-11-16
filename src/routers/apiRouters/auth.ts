import { handlerSignup, handlerLogin, handlerLogout } from '../../controllers/auth.controller.js';
import { Router } from 'express'; import { checkLoggedIn } from '../../middlewares/passport/auth.js';

const router : Router = Router(); 


/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: number
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     code:
 *                       type: string
 *             example:
 *               success: true
 *               message: "회원가입이 완료되었습니다."
 *               data: 
 *                 userId: 1
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *               code: "AUTH_SIGNUP_SUCCESS"
 */
router.post('/signup', handlerSignup as any);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 로그인
 *     description: 사용자 인증을 통해 로그인합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: number
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                 code:
 *                   type: string
 *             example:
 *               success: true
 *               message: "로그인에 성공했습니다."
 *               data:
 *                 userId: 1
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *               code: "AUTH_LOGIN_SUCCESS"
 */
router.post('/login', handlerLogin as any);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 로그아웃
 *     description: 현재 세션을 종료하여 로그아웃합니다.
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 code:
 *                   type: string
 *             example:
 *               success: true
 *               message: "로그아웃되었습니다."
 *               data: null
 *               code: "AUTH_LOGOUT_SUCCESS"
 */
router.post('/logout', checkLoggedIn as any, handlerLogout as any);

export default router;
