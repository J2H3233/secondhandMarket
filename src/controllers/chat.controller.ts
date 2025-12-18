import type { Request, Response, NextFunction } from "express";
import {
    getOrCreateChatRoom,
    getUserChatRooms,
    getChatRoomDetail,
    getChatMessages,
    sendChatMessage,
    createStatusChangeRequest,
    approveStatusChangeRequest,
    rejectStatusChangeRequest,
    updateTradeStatus
} from "../services/chat.service.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";

// 채팅방 생성 또는 기존 채팅방 반환
export const handleCreateChatRoom = async (
    req: Request<{}, {}, { postId: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { postId } = req.body;
        const userId = Number(req.session.userId);

        if (!postId) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '게시글 ID가 필요합니다.');
        }

        const chatRoom = await getOrCreateChatRoom(postId, userId);
        res.jsonSuccess(chatRoom, '채팅방이 생성되었습니다.', 201);
    } catch (error) {
        next(error);
    }
};

// 사용자의 채팅방 목록 조회
export const handleGetUserChatRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = Number(req.session.userId);
        const chatRooms = await getUserChatRooms(userId);
        res.jsonSuccess(chatRooms, '채팅방 목록을 조회했습니다.', 200);
    } catch (error) {
        next(error);
    }
};

// 채팅방 상세 정보 조회
export const handleGetChatRoomDetail = async (
    req: Request<{ tradeId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const chatRoom = await getChatRoomDetail(tradeId, userId);
        res.jsonSuccess(chatRoom, '채팅방 정보를 조회했습니다.', 200);
    } catch (error) {
        next(error);
    }
};

// 채팅 메시지 목록 조회 (페이지네이션 지원)
export const handleGetChatMessages = async (
    req: Request<{ tradeId: string }, {}, {}, { limit?: string; beforeId?: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        const beforeId = req.query.beforeId ? Number(req.query.beforeId) : undefined;
        
        console.log('메시지 조회 요청:', { tradeId, userId, limit, beforeId });
        
        const result = await getChatMessages(tradeId, userId, limit, beforeId);
        
        console.log('메시지 조회 결과:', { 
            count: result.messages.length, 
            hasMore: result.hasMore,
            messageIds: result.messages.map(m => m.id)
        });
        
        res.jsonSuccess(result, '메시지 목록을 조회했습니다.', 200);
    } catch (error) {
        console.error('메시지 조회 오류:', error);
        next(error);
    }
};

// 메시지 전송
export const handleSendMessage = async (
    req: Request<{ tradeId: string }, {}, { content: string; messageType?: string; imageUrl?: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const { content, messageType, imageUrl } = req.body;

        const message = await sendChatMessage(
            tradeId,
            userId,
            content,
            (messageType as any) || 'NORMAL',
            imageUrl
        );
        res.jsonSuccess(message, '메시지를 전송했습니다.', 201);
    } catch (error) {
        next(error);
    }
};

// 상태 변경 요청 (직거래/택배/완료/취소)
export const handleCreateStatusChangeRequest = async (
    req: Request<{ tradeId: string }, {}, { 
        requestedStatus: string;
        regionCode?: string; 
        addressDetail?: string; 
        amount?: number; 
    }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const { requestedStatus, regionCode, addressDetail, amount } = req.body;

        if (!requestedStatus) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '요청할 상태가 필요합니다.');
        }

        const validStatuses = ['PENDING', 'IN_PERSON', 'SHIPPING', 'CANCELED', 'COMPLETED'];
        if (!validStatuses.includes(requestedStatus)) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '유효하지 않은 상태입니다.');
        }

        // 직거래/배송 요청인 경우 추가 정보 검증
        if ((requestedStatus === 'IN_PERSON' || requestedStatus === 'SHIPPING') && 
            (!regionCode || !addressDetail || amount === undefined)) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '직거래/배송 요청에는 지역, 상세주소, 금액 정보가 필요합니다.');
        }

        const result = await createStatusChangeRequest(
            tradeId,
            userId,
            requestedStatus as any,
            (requestedStatus === 'IN_PERSON' || requestedStatus === 'SHIPPING') 
                ? { regionCode: regionCode!, addressDetail: addressDetail!, amount: amount! } 
                : undefined
        );
        res.jsonSuccess(result, '상태 변경 요청이 전송되었습니다.', 201);
    } catch (error) {
        next(error);
    }
};

// 상태 변경 요청 승인
export const handleApproveStatusChangeRequest = async (
    req: Request<{ tradeId: string }, {}, { messageId: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const { messageId } = req.body;

        console.log('상태 변경 승인 요청 수신:', { tradeId, userId, messageId });

        if (!messageId) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '메시지 ID가 필요합니다.');
        }

        const result = await approveStatusChangeRequest(tradeId, messageId, userId);
        console.log('상태 변경 승인 성공:', result);
        res.jsonSuccess(result, '상태 변경 요청이 승인되었습니다.', 200);
    } catch (error) {
        console.error('상태 변경 승인 오류:', error);
        next(error);
    }
};

// 상태 변경 요청 거부
export const handleRejectStatusChangeRequest = async (
    req: Request<{ tradeId: string }, {}, { messageId: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const { messageId } = req.body;

        if (!messageId) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '메시지 ID가 필요합니다.');
        }

        const result = await rejectStatusChangeRequest(tradeId, messageId, userId);
        res.jsonSuccess(result, '상태 변경 요청이 거부되었습니다.', 200);
    } catch (error) {
        next(error);
    }
};

// 채팅방 거래 상태 업데이트
export const handleUpdateTradeStatus = async (
    req: Request<{ tradeId: string }, {}, { status: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tradeId = Number(req.params.tradeId);
        const userId = Number(req.session.userId);
        const { status } = req.body;

        const validStatuses = ['PENDING', 'IN_PERSON', 'SHIPPING', 'CANCELED', 'COMPLETED'];
        if (!status || !validStatuses.includes(status)) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '유효하지 않은 상태입니다.');
        }

        const result = await updateTradeStatus(tradeId, userId, status as any);
        res.jsonSuccess(result, '거래 상태가 업데이트되었습니다.', 200);
    } catch (error) {
        next(error);
    }
};
