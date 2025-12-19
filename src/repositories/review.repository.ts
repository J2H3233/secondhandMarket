import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';

// 리뷰 생성
export const createReview = async (
    trade_record_id: number,
    post_id: number,
    rating: number,
    content: string,
    client: DBClient = prisma
) => {
    try {
        return await client.review.create({
            data: {
                trade_record_id: trade_record_id,
                post_id: post_id,
                rating: rating,
                content: content
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 생성시 db 오류가 발생했습니다.');
    }
};

// 특정 게시글의 리뷰 목록 조회
export const findReviewsByPostId = async (
    post_id: number,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.review.findMany({
            where: { post_id: post_id },
            include: {
                trade_record: {
                    include: {
                        trade: {
                            include: {
                                buyer: {
                                    select: {
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                },
                review_img: true
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 조회시 db 오류가 발생했습니다.');
    }
};

// 특정 게시글의 리뷰 개수 조회
export const countReviewsByPostId = async (
    post_id: number,
    client: DBClient = prisma
) => {
    try {
        return await client.review.count({
            where: { post_id: post_id }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 개수 조회시 db 오류가 발생했습니다.');
    }
};

// 특정 거래 기록의 리뷰 존재 여부 확인
export const findReviewByTradeRecordId = async (
    trade_record_id: number,
    client: DBClient = prisma
) => {
    try {
        return await client.review.findFirst({
            where: { trade_record_id: trade_record_id }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 조회시 db 오류가 발생했습니다.');
    }
};

// 특정 사용자가 받은 리뷰 조회 (판매자로서)
export const findReviewsByUserId = async (
    user_id: number,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.review.findMany({
            where: {
                post: {
                    posting_user_id: user_id
                }
            },
            include: {
                trade_record: {
                    include: {
                        trade: {
                            include: {
                                buyer: {
                                    select: {
                                        id: true,
                                        username: true
                                    }
                                },
                                post: {
                                    select: {
                                        id: true,
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                },
                review_img: true
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 조회시 db 오류가 발생했습니다.');
    }
};

// 특정 사용자가 받은 리뷰 개수 조회
export const countReviewsByUserId = async (
    user_id: number,
    client: DBClient = prisma
) => {
    try {
        return await client.review.count({
            where: {
                post: {
                    posting_user_id: user_id
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '리뷰 개수 조회시 db 오류가 발생했습니다.');
    }
};
