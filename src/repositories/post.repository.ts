import type { PostTransactionType, PostStatus } from '@prisma/client';
import { prisma } from '../config/db.config.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';
import type { DBClient } from '../types/db.types.js';


export const createPost = async (
    region_code: string,
    posting_user_id: number,
    price: number,
    delivery_charge: number,
    transaction_type: PostTransactionType,
    content: string,
    title: string,
    category_name: string | undefined,
    client: DBClient = prisma
) => {
    try {
        return await client.post.create({
            data: {
                region: {
                    connect: { region_code: region_code }
                },
                posting_user: {
                    connect: { id: posting_user_id }
                },
                ...(category_name && {
                    category: {
                        connect: { category_name: category_name }
                    }
                }),
                price: price,
                delivery_charge: delivery_charge,
                transaction_type: transaction_type,
                content: content,
                title: title
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 생성시 db 오류가 발생했습니다.');
    }
}

export const findPostById = async (id: number, client: DBClient = prisma) => {
    try {
        return await client.post.findUnique({
            where: { 
                id: id,
                is_deleted: false
            }
        });
            
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 조회시 db 오류가 발생했습니다.');
    }
}

export const softdeletePostById = async (id: number, client: DBClient = prisma) => {
    try {
        return await client.post.update({
            where: { 
                id: id, 
                is_deleted: false },
            data: { 
                is_deleted: true,
                deleted_at: new Date()}
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 삭제시 db 오류가 발생했습니다.');
    }
}

export const updatePost = async (
    id: number,
    title: string,
    content: string,
    price: number,
    delivery_charge: number,
    transaction_type: PostTransactionType,
    category_name: string | undefined,
    status?: PostStatus,
    client: DBClient = prisma
) => {
    try {
        const updateData: any = {
            title: title,
            content: content,
            price: price,
            delivery_charge: delivery_charge,
            transaction_type: transaction_type,
            ...(category_name && {
                category: {
                    connect: { category_name: category_name }
                }
            })
        };
        
        // status가 제공되면 업데이트
        if (status !== undefined) {
            updateData.status = status;
        }
        
        return await client.post.update({
            where: { 
                id: id,
                is_deleted: false
            },
            data: updateData
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 수정시 db 오류가 발생했습니다.');
    }
}

export const findPostDetailsById = async (id: number, client: DBClient = prisma) => {
    try {
        return await client.post.findUnique({
            where: { 
                id: id,
                is_deleted: false
            },
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
                        eubmyeonli: true,
                        region_code: true
                    }
                },
                post_img: {
                    select: {
                        id: true,
                        url: true,
                        order: true
                    },
                    orderBy: [
                        { id: "asc" },
                        { order: "asc" }
                    ]
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 상세 조회시 db 오류가 발생했습니다.');
    }
}

// 최신 게시글 목록 조회
export const findLatestPosts = async (
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.post.findMany({
            where: {
                is_deleted: false
            },
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
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 목록 조회시 db 오류가 발생했습니다.');
    }
}

// 검색어로 게시글 검색 (제목 + 내용)
export const searchPosts = async (
    searchQuery: string,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.post.findMany({
            where: {
                is_deleted: false,
                OR: [
                    {
                        title: {
                            contains: searchQuery
                        }
                    },
                    {
                        content: {
                            contains: searchQuery
                        }
                    }
                ]
            },
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
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 검색시 db 오류가 발생했습니다.');
    }
}

// 전체 게시글 개수 조회
export const countAllPosts = async (
    client: DBClient = prisma
) => {
    try {
        return await client.post.count({
            where: {
                is_deleted: false
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 개수 조회시 db 오류가 발생했습니다.');
    }
}

// 카테고리별 게시글 개수 조회
export const countPostsByCategory = async (
    categoryName: string,
    client: DBClient = prisma
) => {
    try {
        return await client.post.count({
            where: {
                is_deleted: false,
                category: {
                    category_name: categoryName
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '카테고리별 게시물 개수 조회시 db 오류가 발생했습니다.');
    }
}

// 검색 결과 개수 조회
export const countSearchPosts = async (
    searchQuery: string,
    client: DBClient = prisma
) => {
    try {
        return await client.post.count({
            where: {
                is_deleted: false,
                OR: [
                    {
                        title: {
                            contains: searchQuery
                        }
                    },
                    {
                        content: {
                            contains: searchQuery
                        }
                    }
                ]
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '검색 결과 개수 조회시 db 오류가 발생했습니다.');
    }
}

// 카테고리별 게시글 목록 조회
export const findPostsByCategory = async (
    categoryName: string,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.post.findMany({
            where: {
                is_deleted: false,
                category: {
                    category_name: categoryName
                }
            },
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
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '카테고리별 게시물 목록 조회시 db 오류가 발생했습니다.');
    }
}

// 특정 사용자의 게시글 목록 조회
export const findPostsByUserId = async (
    userId: number,
    limit: number = 20,
    offset: number = 0,
    client: DBClient = prisma
) => {
    try {
        return await client.post.findMany({
            where: {
                posting_user_id: userId,
                is_deleted: false
            },
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
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 게시물 목록 조회시 db 오류가 발생했습니다.');
    }
}

// 특정 사용자의 게시글 총 개수 조회
export const countPostsByUserId = async (
    userId: number,
    client: DBClient = prisma
) => {
    try {
        return await client.post.count({
            where: {
                posting_user_id: userId,
                is_deleted: false
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '사용자 게시물 개수 조회시 db 오류가 발생했습니다.');
    }
}