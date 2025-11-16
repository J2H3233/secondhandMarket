import { handlerSignup, handlerLogin, handlerLogout } from '../../controllers/auth.controller.js';
import { Router } from 'express'; import { checkLoggedIn } from '../../middlewares/passport/auth.js';

const router : Router = Router(); 

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - phone_num
 *         - region_code
 *       properties:
 *         username:
 *           type: string
 *           example: "john_doe"
 *         password:
 *           type: string
 *           example: "password123"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         phone_num:
 *           type: string
 *           example: "010-1234-5678"
 *         region_code:
 *           type: string
 *           example: "seoul"
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.post('/signup', handlerSignup as any);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.post('/login', handlerLogin as any);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 로그아웃
 *     responses:
 *       '200':
 *         description: 요청 처리됨
 */
router.post('/logout', checkLoggedIn as any, handlerLogout as any);

export default router;
