import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';
import type { TradeStatus, MessageType } from '@prisma/client';

// 채팅방(trade) 생성
export const createChatRoom = async (
    postId: number,
    buyerId: number,
    sellerId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.create({
            data: {
                post_id: postId,
                buyer_id: buyerId,
                seller_id: sellerId,
                status: 'PENDING',
                is_close: false
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        post_img: {
                            select: { url: true },
                            take: 1,
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                buyer: {
                    select: { id: true, username: true }
                },
                seller: {
                    select: { id: true, username: true }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '채팅방 생성 중 DB 오류가 발생했습니다.');
    }
};

// 기존 채팅방 조회 (postId + buyerId 기준)
export const findExistingChatRoom = async (
    postId: number,
    buyerId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.findFirst({
            where: {
                post_id: postId,
                buyer_id: buyerId,
                is_close: false
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        post_img: {
                            select: { url: true },
                            take: 1,
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                buyer: {
                    select: { id: true, username: true }
                },
                seller: {
                    select: { id: true, username: true }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '채팅방 조회 중 DB 오류가 발생했습니다.');
    }
};

// 채팅방 ID로 조회
export const findChatRoomById = async (
    tradeId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.findUnique({
            where: { id: tradeId },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        posting_user_id: true,
                        post_img: {
                            select: { url: true },
                            take: 1,
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                buyer: {
                    select: { id: true, username: true }
                },
                seller: {
                    select: { id: true, username: true }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '채팅방 조회 중 DB 오류가 발생했습니다.');
    }
};

// 사용자의 채팅방 목록 조회 (최신순)
export const findUserChatRooms = async (
    userId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.findMany({
            where: {
                OR: [
                    { buyer_id: userId },
                    { seller_id: userId }
                ],
                is_close: false
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        post_img: {
                            select: { url: true },
                            take: 1,
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                buyer: {
                    select: { id: true, username: true }
                },
                seller: {
                    select: { id: true, username: true }
                },
                message: {
                    select: {
                        content: true,
                        created_at: true
                    },
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            },
            orderBy: { updated_at: 'desc' }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '채팅방 목록 조회 중 DB 오류가 발생했습니다.');
    }
};

// 채팅방의 메시지 목록 조회 (페이지네이션 지원)
export const findChatMessages = async (
    tradeId: number,
    limit: number = 50,
    beforeId?: number,
    client: DBClient = prisma
) => {
    try {
        const whereCondition: any = { trade_id: tradeId };
        
        // 특정 메시지 ID 이전의 메시지만 조회 (무한 스크롤용)
        if (beforeId) {
            whereCondition.id = { lt: beforeId };
        }

        return await client.message.findMany({
            where: whereCondition,
            include: {
                sender: {
                    select: { id: true, username: true }
                },
                message_img: {
                    select: { url: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '메시지 조회 중 DB 오류가 발생했습니다.');
    }
};

// 메시지 생성
export const createMessage = async (
    tradeId: number,
    senderId: number,
    content: string | null,
    messageType: MessageType = 'NORMAL',
    client: DBClient = prisma
) => {
    try {
        return await client.message.create({
            data: {
                trade_id: tradeId,
                sender_id: senderId,
                content: content,
                message_type: messageType
            },
            include: {
                sender: {
                    select: { id: true, username: true }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '메시지 생성 중 DB 오류가 발생했습니다.');
    }
};

// 메시지 이미지 생성
export const createMessageImage = async (
    messageId: number,
    url: string,
    client: DBClient = prisma
) => {
    try {
        return await client.message_img.create({
            data: {
                message_id: messageId,
                url: url
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '메시지 이미지 생성 중 DB 오류가 발생했습니다.');
    }
};

// 거래 상태 업데이트
export const updateTradeStatus = async (
    tradeId: number,
    status: TradeStatus,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.update({
            where: { id: tradeId },
            data: {
                status: status,
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '거래 상태 업데이트 중 DB 오류가 발생했습니다.');
    }
};

// 거래 기록 생성
export const createTradeRecord = async (
    tradeId: number,
    regionId: number | null,
    amount: number,
    addressDetail: string,
    client: DBClient = prisma
) => {
    try {
        return await client.trade_record.create({
            data: {
                trade_id: tradeId,
                region_id: regionId,
                amount: amount,
                address_detail: addressDetail
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '거래 기록 생성 중 DB 오류가 발생했습니다.');
    }
};

// 지역 ID 조회 (region_code로)
export const findRegionByCode = async (
    regionCode: string,
    client: DBClient = prisma
) => {
    try {
        return await client.region.findUnique({
            where: { region_code: regionCode }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '지역 조회 중 DB 오류가 발생했습니다.');
    }
};

// 거래 기록 조회 (tradeId로)
export const findTradeRecordByTradeId = async (
    tradeId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade_record.findFirst({
            where: { trade_id: tradeId },
            orderBy: { created_at: 'desc' }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '거래 기록 조회 중 DB 오류가 발생했습니다.');
    }
};
