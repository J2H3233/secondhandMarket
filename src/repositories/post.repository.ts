import type { PostTransactionType } from '@prisma/client';
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
                        url: true
                    },
                    orderBy: {
                        id: 'asc'
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 상세 조회시 db 오류가 발생했습니다.');
    }
}