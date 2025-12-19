import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';

// 사용자의 구매 거래 내역 조회 (구매자로서)
export const findTradesByBuyerId = async (
    userId: number,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.findMany({
            where: {
                buyer_id: userId
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        post_img: {
                            select: {
                                url: true,
                                order: true
                            },
                            orderBy: { order: 'asc' },
                            take: 1
                        }
                    }
                },
                seller: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                trade_record: {
                    select: {
                        id: true,
                        amount: true,
                        created_at: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '구매 거래 내역 조회시 db 오류가 발생했습니다.');
    }
};

// 사용자의 판매 거래 내역 조회 (판매자로서)
export const findTradesBySellerId = async (
    userId: number,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.findMany({
            where: {
                seller_id: userId
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        post_img: {
                            select: {
                                url: true,
                                order: true
                            },
                            orderBy: { order: 'asc' },
                            take: 1
                        }
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                trade_record: {
                    select: {
                        id: true,
                        amount: true,
                        created_at: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '판매 거래 내역 조회시 db 오류가 발생했습니다.');
    }
};

// 사용자의 구매 거래 총 개수
export const countTradesByBuyerId = async (
    userId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.count({
            where: {
                buyer_id: userId
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '구매 거래 개수 조회시 db 오류가 발생했습니다.');
    }
};

// 사용자의 판매 거래 총 개수
export const countTradesBySellerId = async (
    userId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.trade.count({
            where: {
                seller_id: userId
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '판매 거래 개수 조회시 db 오류가 발생했습니다.');
    }
};
