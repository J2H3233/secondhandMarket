import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';

// 찜하기 (추가)
export const addFavorite = async (userId: number, postId: number, client: DBClient = prisma) => {
    try {
        return await client.post_following.create({
            data: {
                user_id: userId,
                post_id: postId
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '찜 추가 중 DB 오류가 발생했습니다.');
    }
};

// 찜 취소 (삭제)
export const removeFavorite = async (userId: number, postId: number, client: DBClient = prisma) => {
    try {
        return await client.post_following.deleteMany({
            where: {
                user_id: userId,
                post_id: postId
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '찜 취소 중 DB 오류가 발생했습니다.');
    }
};

// 찜 여부 확인
export const checkFavorite = async (userId: number, postId: number, client: DBClient = prisma) => {
    try {
        const favorite = await client.post_following.findFirst({
            where: {
                user_id: userId,
                post_id: postId
            }
        });
        return favorite !== null;
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '찜 여부 확인 중 DB 오류가 발생했습니다.');
    }
};

// 사용자의 찜 목록 조회
export const getUserFavorites = async (userId: number, limit: number = 20, offset: number = 0, client: DBClient = prisma) => {
    try {
        return await client.post_following.findMany({
            where: {
                user_id: userId
            },
            include: {
                post: {
                    include: {
                        posting_user: {
                            select: {
                                id: true,
                                username: true
                            }
                        },
                        category: {
                            select: {
                                id: true,
                                category_name: true
                            }
                        },
                        region: {
                            select: {
                                id: true,
                                sido: true,
                                sigungu: true,
                                eubmyeonli: true
                            }
                        },
                        post_img: {
                            select: {
                                id: true,
                                url: true,
                                order: true
                            },
                            orderBy: { order: 'asc' },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '찜 목록 조회 중 DB 오류가 발생했습니다.');
    }
};

// 게시글의 찜 수 조회
export const getFavoriteCount = async (postId: number, client: DBClient = prisma) => {
    try {
        return await client.post_following.count({
            where: {
                post_id: postId
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '찜 수 조회 중 DB 오류가 발생했습니다.');
    }
};
