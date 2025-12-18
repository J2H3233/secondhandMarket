import { Router } from 'express';
import { checkLoggedIn } from '../../middlewares/passport/auth.js';
import {
    handleCreateChatRoom,
    handleGetUserChatRooms,
    handleGetChatRoomDetail,
    handleGetChatMessages,
    handleSendMessage,
    handleCreateStatusChangeRequest,
    handleApproveStatusChangeRequest,
    handleRejectStatusChangeRequest,
    handleUpdateTradeStatus
} from '../../controllers/chat.controller.js';

const router: Router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: 채팅방 생성 (또는 기존 채팅방 반환)
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: number
 *                 description: 게시글 ID
 *     responses:
 *       201:
 *         description: 채팅방 생성 성공
 */
router.post('/', checkLoggedIn as any, handleCreateChatRoom as any);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: 내 채팅방 목록 조회
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: 채팅방 목록 조회 성공
 */
router.get('/', checkLoggedIn as any, handleGetUserChatRooms as any);

/**
 * @swagger
 * /api/chat/{tradeId}:
 *   get:
 *     summary: 채팅방 상세 정보 조회
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *         description: 채팅방(거래) ID
 *     responses:
 *       200:
 *         description: 채팅방 조회 성공
 */
router.get('/:tradeId', checkLoggedIn as any, handleGetChatRoomDetail as any);

/**
 * @swagger
 * /api/chat/{tradeId}/messages:
 *   get:
 *     summary: 채팅 메시지 목록 조회
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 */
router.get('/:tradeId/messages', checkLoggedIn as any, handleGetChatMessages as any);

/**
 * @swagger
 * /api/chat/{tradeId}/messages:
 *   post:
 *     summary: 메시지 전송
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 */
router.post('/:tradeId/messages', checkLoggedIn as any, handleSendMessage as any);

/**
 * @swagger
 * /api/chat/{tradeId}/status-request:
 *   post:
 *     summary: 상태 변경 요청 (직거래/택배/완료/취소)
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestedStatus
 *             properties:
 *               requestedStatus:
 *                 type: string
 *                 enum: [PENDING, IN_PERSON, SHIPPING, COMPLETED, CANCELED]
 *               regionCode:
 *                 type: string
 *                 description: 직거래/배송 시 필수
 *               addressDetail:
 *                 type: string
 *                 description: 직거래/배송 시 필수
 *               amount:
 *                 type: number
 *                 description: 직거래/배송 시 필수
 *     responses:
 *       201:
 *         description: 상태 변경 요청 성공
 */
router.post('/:tradeId/status-request', checkLoggedIn as any, handleCreateStatusChangeRequest as any);

// 하위 호환성을 위해 기존 trade-request 엔드포인트도 유지
router.post('/:tradeId/trade-request', checkLoggedIn as any, handleCreateStatusChangeRequest as any);

/**
 * @swagger
 * /api/chat/{tradeId}/approve:
 *   post:
 *     summary: 상태 변경 요청 승인
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: number
 *     responses:
 *       200:
 *         description: 상태 변경 승인 성공
 */
router.post('/:tradeId/approve', checkLoggedIn as any, handleApproveStatusChangeRequest as any);

/**
 * @swagger
 * /api/chat/{tradeId}/reject:
 *   post:
 *     summary: 상태 변경 요청 거부
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: number
 *     responses:
 *       200:
 *         description: 상태 변경 거부 성공
 */
router.post('/:tradeId/reject', checkLoggedIn as any, handleRejectStatusChangeRequest as any);

/**
 * @swagger
 * /api/chat/{tradeId}/status:
 *   put:
 *     summary: 채팅방 거래 상태 업데이트
 *     tags: [Chat]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PERSON, SHIPPING, CANCELED, COMPLETED]
 *     responses:
 *       200:
 *         description: 상태 업데이트 성공
 */
router.put('/:tradeId/status', checkLoggedIn as any, handleUpdateTradeStatus as any);

export default router;
