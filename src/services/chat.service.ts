import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import {
    createChatRoom,
    findExistingChatRoom,
    findChatRoomById,
    findUserChatRooms,
    findChatMessages,
    createMessage,
    createMessageImage,
    updateTradeStatus as updateTradeStatusInDb,
    createTradeRecord,
    findRegionByCode,
} from "../repositories/chat.repository.js";
import { findPostById } from "../repositories/post.repository.js";
import type { TradeStatus, MessageType } from "@prisma/client";

// ============================================
// 상태 관련 상수 및 타입
// ============================================

// 거래 상태 요청 타입
export type StatusRequestType = 'IN_PERSON' | 'SHIPPING' | 'COMPLETED' | 'CANCELED' | 'PENDING';

// 메시지 내 상태 요청 데이터 구조
export interface StatusRequestContent {
    type: 'STATUS_REQUEST';
    requestedStatus: StatusRequestType;
    currentStatus: TradeStatus;
    // 직거래/배송 요청 시 추가 정보
    regionCode?: string;
    regionName?: string;
    addressDetail?: string;
    amount?: number;
    // 요청 상태
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ============================================
// 채팅방 관련 서비스
// ============================================

// 채팅방 생성 또는 기존 채팅방 반환
export const getOrCreateChatRoom = async (
    postId: number,
    buyerId: number
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        // 게시글 조회
        const post = await findPostById(postId, tx);
        if (!post) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시글을 찾을 수 없습니다.');
        }

        // 판매자와 구매자가 같은 경우 체크
        if (post.posting_user_id === buyerId) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '자신의 게시글에는 채팅을 시작할 수 없습니다.');
        }

        // 기존 채팅방 확인
        const existingRoom = await findExistingChatRoom(postId, buyerId, tx);
        if (existingRoom) {
            return existingRoom;
        }

        // 새 채팅방 생성
        const newRoom = await createChatRoom(postId, buyerId, post.posting_user_id, tx);
        return newRoom;
    });
};

// 사용자의 채팅방 목록 조회
export const getUserChatRooms = async (userId: number): Promise<any[]> => {
    const chatRooms = await findUserChatRooms(userId);
    
    return chatRooms.map(room => {
        const otherUser = room.buyer_id === userId ? room.seller : room.buyer;
        const lastMessage = room.message[0];
        
        return {
            id: room.id,
            postId: room.post.id,
            postTitle: room.post.title,
            postImageUrl: room.post.post_img[0]?.url || null,
            postPrice: room.post.price,
            otherUserId: otherUser.id,
            otherUserName: otherUser.username,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.created_at || room.updated_at,
            status: room.status,
            updatedAt: room.updated_at
        };
    });
};

// 채팅방 상세 정보 조회
export const getChatRoomDetail = async (
    tradeId: number,
    userId: number
): Promise<any> => {
    const chatRoom = await findChatRoomById(tradeId);
    
    if (!chatRoom) {
        throw new CustomError(404, ErrorCodes.NOT_FOUND, '채팅방을 찾을 수 없습니다.');
    }

    // 해당 채팅방의 참여자인지 확인
    if (chatRoom.buyer_id !== userId && chatRoom.seller_id !== userId) {
        throw new CustomError(403, ErrorCodes.UNAUTHORIZED, '이 채팅방에 접근할 권한이 없습니다.');
    }

    return chatRoom;
};

// 채팅 메시지 목록 조회 (페이지네이션 지원)
export const getChatMessages = async (
    tradeId: number,
    userId: number,
    limit: number = 50,
    beforeId?: number
): Promise<{ messages: any[], hasMore: boolean }> => {
    // 먼저 채팅방 접근 권한 확인
    await getChatRoomDetail(tradeId, userId);
    
    const messages = await findChatMessages(tradeId, limit + 1, beforeId);
    
    // limit + 1개를 가져와서 더 있는지 확인
    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    
    // 시간순으로 정렬 (오래된 것부터)
    const sortedMessages = resultMessages.reverse();
    
    return {
        messages: sortedMessages.map(msg => ({
            id: msg.id,
            senderId: msg.sender.id,
            senderName: msg.sender.username,
            content: msg.content,
            messageType: msg.message_type,
            imageUrl: msg.message_img?.url || null,
            createdAt: msg.created_at
        })),
        hasMore
    };
};

// ============================================
// 메시지 전송 서비스
// ============================================

// 일반 메시지 전송
export const sendChatMessage = async (
    tradeId: number,
    senderId: number,
    content: string | null,
    messageType: MessageType = 'NORMAL',
    imageUrl?: string
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        const message = await createMessage(tradeId, senderId, content, messageType, tx);
        
        if (imageUrl) {
            await createMessageImage(message.id, imageUrl, tx);
        }

        // 채팅방 updated_at 업데이트
        await tx.trade.update({
            where: { id: tradeId },
            data: { updated_at: new Date() }
        });

        return message;
    });
};

// ============================================
// 상태 변경 요청 서비스 (통합)
// ============================================

// 상태 변경 요청 생성 (모든 상태 변경에 사용)
export const createStatusChangeRequest = async (
    tradeId: number,
    userId: number,
    requestedStatus: StatusRequestType,
    // 직거래/배송 요청 시 필요한 추가 정보
    additionalInfo?: {
        regionCode?: string;
        addressDetail?: string;
        amount?: number;
    }
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        // 채팅방 확인 및 권한 체크
        const chatRoom = await findChatRoomById(tradeId);
        if (!chatRoom) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '채팅방을 찾을 수 없습니다.');
        }

        if (chatRoom.buyer_id !== userId && chatRoom.seller_id !== userId) {
            throw new CustomError(403, ErrorCodes.UNAUTHORIZED, '이 채팅방에 접근할 권한이 없습니다.');
        }

        // 직거래/배송 요청 시 추가 정보 검증
        let regionName = '';
        if (requestedStatus === 'IN_PERSON' || requestedStatus === 'SHIPPING') {
            if (!additionalInfo?.regionCode || !additionalInfo?.addressDetail || additionalInfo?.amount === undefined) {
                throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '직거래/배송 요청에는 지역, 상세주소, 금액 정보가 필요합니다.');
            }
            
            // 지역 정보 조회
            const region = await findRegionByCode(additionalInfo.regionCode, tx);
            if (region) {
                regionName = `${region.sido || ''} ${region.sigungu || ''} ${region.eubmyeonli || ''}`.trim();
            } else {
                regionName = additionalInfo.regionCode;
            }
        }

        // 요청 메시지 내용 구성
        const requestContent: StatusRequestContent = {
            type: 'STATUS_REQUEST',
            requestedStatus: requestedStatus,
            currentStatus: chatRoom.status,
            status: 'PENDING'
        };

        // 직거래/배송 요청 시 추가 정보 포함
        if ((requestedStatus === 'IN_PERSON' || requestedStatus === 'SHIPPING') && additionalInfo) {
            requestContent.regionCode = additionalInfo.regionCode!;
            requestContent.regionName = regionName;
            requestContent.addressDetail = additionalInfo.addressDetail!;
            requestContent.amount = additionalInfo.amount!;
        }

        // 메시지 타입 결정
        let messageType: MessageType;
        switch (requestedStatus) {
            case 'IN_PERSON':
                messageType = 'IN_PERSON';
                break;
            case 'SHIPPING':
                messageType = 'SHIPPING';
                break;
            case 'COMPLETED':
                messageType = 'COMPLETED';
                break;
            case 'CANCELED':
                messageType = 'CANCELED';
                break;
            default:
                messageType = 'PENDING';
        }

        // 메시지 생성
        const message = await createMessage(
            tradeId,
            userId,
            JSON.stringify(requestContent),
            messageType,
            tx
        );

        // 채팅방 updated_at 업데이트
        await tx.trade.update({
            where: { id: tradeId },
            data: { updated_at: new Date() }
        });

        return {
            message: message,
            requestData: requestContent
        };
    });
};

// 상태 변경 요청 승인
export const approveStatusChangeRequest = async (
    tradeId: number,
    messageId: number,
    userId: number
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        // 채팅방 확인
        const chatRoom = await findChatRoomById(tradeId);
        if (!chatRoom) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '채팅방을 찾을 수 없습니다.');
        }

        // 참여자 확인
        if (chatRoom.buyer_id !== userId && chatRoom.seller_id !== userId) {
            throw new CustomError(403, ErrorCodes.UNAUTHORIZED, '이 채팅방에 접근할 권한이 없습니다.');
        }

        // 요청 메시지 조회
        const requestMessage = await tx.message.findUnique({
            where: { id: messageId }
        });

        if (!requestMessage) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '요청 메시지를 찾을 수 없습니다.');
        }

        // 요청자와 승인자가 다른지 확인
        if (requestMessage.sender_id === userId) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '자신의 요청은 직접 승인할 수 없습니다.');
        }

        // 요청 내용 파싱
        let requestData: StatusRequestContent;
        try {
            requestData = JSON.parse(requestMessage.content || '{}');
        } catch (e) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '잘못된 요청 형식입니다.');
        }

        // 기존 TRADE_REQUEST 형식도 지원 (하위 호환성)
        if (requestData.type !== 'STATUS_REQUEST' && (requestData as any).type !== 'TRADE_REQUEST') {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '상태 변경 요청 메시지가 아닙니다.');
        }

        if (requestData.status !== 'PENDING') {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '이미 처리된 요청입니다.');
        }

        // 기존 TRADE_REQUEST 형식 변환
        const requestedStatus = requestData.requestedStatus || (requestData as any).transactionType;
        const newStatus: TradeStatus = requestedStatus as TradeStatus;

        // 거래 상태 업데이트
        await updateTradeStatusInDb(tradeId, newStatus, tx);

        // 직거래/배송인 경우 거래 기록 생성
        if ((newStatus === 'IN_PERSON' || newStatus === 'SHIPPING') && requestData.regionCode) {
            const region = await findRegionByCode(requestData.regionCode, tx);
            await createTradeRecord(
                tradeId,
                region?.id || null,
                requestData.amount || 0,
                requestData.addressDetail || '',
                tx
            );
        }

        // 요청 메시지 업데이트 (승인됨으로 변경)
        const updatedContent = {
            ...requestData,
            status: 'APPROVED'
        };
        
        await tx.message.update({
            where: { id: messageId },
            data: { content: JSON.stringify(updatedContent) }
        });

        // 승인 시스템 메시지 생성
        const statusTextMap: Record<string, string> = {
            'IN_PERSON': '직거래',
            'SHIPPING': '배송',
            'COMPLETED': '거래완료',
            'CANCELED': '거래취소',
            'PENDING': '협의중'
        };
        const statusText = statusTextMap[newStatus] || newStatus;
        
        let systemMessageContent = `거래 상태가 '${statusText}'(으)로 변경되었습니다.`;
        if (requestData.amount) {
            systemMessageContent = `거래가 승인되었습니다. (${statusText}, ${requestData.amount.toLocaleString()}원)`;
        }

        await createMessage(
            tradeId,
            userId,
            systemMessageContent,
            'NORMAL',
            tx
        );

        return {
            newStatus,
            requestData: updatedContent
        };
    });
};

// 상태 변경 요청 거부
export const rejectStatusChangeRequest = async (
    tradeId: number,
    messageId: number,
    userId: number
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        // 채팅방 확인
        const chatRoom = await findChatRoomById(tradeId);
        if (!chatRoom) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '채팅방을 찾을 수 없습니다.');
        }

        // 참여자 확인
        if (chatRoom.buyer_id !== userId && chatRoom.seller_id !== userId) {
            throw new CustomError(403, ErrorCodes.UNAUTHORIZED, '이 채팅방에 접근할 권한이 없습니다.');
        }

        // 요청 메시지 조회
        const requestMessage = await tx.message.findUnique({
            where: { id: messageId }
        });

        if (!requestMessage) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '요청 메시지를 찾을 수 없습니다.');
        }

        // 요청 내용 파싱
        let requestData: any;
        try {
            requestData = JSON.parse(requestMessage.content || '{}');
        } catch (e) {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '잘못된 요청 형식입니다.');
        }

        if (requestData.type !== 'STATUS_REQUEST' && requestData.type !== 'TRADE_REQUEST') {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '상태 변경 요청 메시지가 아닙니다.');
        }

        if (requestData.status !== 'PENDING') {
            throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '이미 처리된 요청입니다.');
        }

        // 요청 메시지 업데이트 (거부됨으로 변경)
        const updatedContent = {
            ...requestData,
            status: 'REJECTED'
        };
        
        await tx.message.update({
            where: { id: messageId },
            data: { content: JSON.stringify(updatedContent) }
        });

        // 거부 시스템 메시지 생성
        await createMessage(
            tradeId,
            userId,
            '상태 변경 요청이 거부되었습니다.',
            'NORMAL',
            tx
        );

        return { 
            success: true,
            requestData: updatedContent
        };
    });
};

// ============================================
// 하위 호환성을 위한 기존 함수들
// ============================================

// 거래 요청 (직거래/택배) - createStatusChangeRequest로 대체됨
export const createTradeRequest = async (
    tradeId: number,
    userId: number,
    regionCode: string,
    addressDetail: string,
    amount: number,
    transactionType: 'IN_PERSON' | 'SHIPPING'
): Promise<any> => {
    return await createStatusChangeRequest(tradeId, userId, transactionType, {
        regionCode,
        addressDetail,
        amount
    });
};

// 거래 요청 승인 - approveStatusChangeRequest로 대체됨
export const approveTradeRequest = async (
    tradeId: number,
    messageId: number,
    userId: number
): Promise<any> => {
    return await approveStatusChangeRequest(tradeId, messageId, userId);
};

// 거래 요청 거부 - rejectStatusChangeRequest로 대체됨
export const rejectTradeRequest = async (
    tradeId: number,
    messageId: number,
    userId: number
): Promise<any> => {
    return await rejectStatusChangeRequest(tradeId, messageId, userId);
};

// 거래 상태 직접 업데이트 (소켓에서 사용)
export const updateTradeStatus = async (
    tradeId: number,
    userId: number,
    status: TradeStatus
): Promise<any> => {
    return await prisma.$transaction(async (tx) => {
        // 채팅방 확인
        const chatRoom = await findChatRoomById(tradeId);
        if (!chatRoom) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '채팅방을 찾을 수 없습니다.');
        }

        // 참여자 확인
        if (chatRoom.buyer_id !== userId && chatRoom.seller_id !== userId) {
            throw new CustomError(403, ErrorCodes.UNAUTHORIZED, '이 채팅방에 접근할 권한이 없습니다.');
        }

        // 거래 상태 업데이트
        const updatedTrade = await updateTradeStatusInDb(tradeId, status, tx);

        return updatedTrade;
    });
};