import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { createPost, findPostById, softdeletePostById, findPostDetailsById, findLatestPosts } from "../repositories/post.repository.js";
import type { PostTransactionType } from "@prisma/client";
import type { MulterFile } from "../types/image.types.js";


export const createPostSevice = async (
    region_code: string,
    posting_user_id: number,
    price: number,
    delivery_charge: number,
    transaction_type: PostTransactionType,
    content: string,
    title: string,
    category_name: string | undefined,
    image_files: MulterFile[]
): Promise<any> => {

    const newPost = await prisma.$transaction(async (tx) => {
        const createdPost = await createPost(
            region_code,
            posting_user_id,
            price,
            delivery_charge,
            transaction_type as PostTransactionType,
            content,
            title,
            category_name,
            tx
        );

        if (image_files && image_files.length > 0) {
            await createPostImages(createdPost.id, image_files.map(file => file.filename), tx);
        }

        const resultPost = await findPostById(createdPost.id, tx);
        if (!resultPost) {
            throw new CustomError(500, ErrorCodes.DB_OPERATION_FAILED, '게시물 생성 후 조회시 오류가 발생했습니다.');
        }
        return resultPost;
    });
    return newPost;

}

const createPostImages = async (
    postId: number, 
    fileNames: string[], // MulterFile.filename 배열
    tx: any // Prisma.TransactionClient
): Promise<void> => {
    
    const dataToCreate = fileNames.map((fileName, index) => ({
        post_id: postId,
        // DB에 저장: 클라이언트가 접근할 수 있는 경로/파일명
        // 예: 'post_images/filename.jpg'. 이 경로 앞에 서버의 도메인이 붙어 최종 URL이 됩니다.
        url: fileName, 
        order: index + 1, 
    }));

    await tx.post_img.createMany({
        data: dataToCreate,
        skipDuplicates: true,
    });
}

export const getPost = async (id: number, tx?: any): Promise<any> => {
    const post = await findPostById(id, tx);
    if (!post) {
        throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
    }
    return post;     
}

export const getPostDetails = async (id: number): Promise<any> => {
    const postDetails = await prisma.$transaction(async (tx) => {
        const post = await findPostDetailsById(id, tx);
        if (!post) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
        }
        return post;
    });
    return postDetails;
}

export const softdeletePostByIdService = async (id: number): Promise<any> => {
    const deletedPost = await prisma.$transaction(async (tx) => {
        const post = await findPostById(id, tx);
        if (!post) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
        }
        return await softdeletePostById(id, tx);
    });
    return deletedPost;
}

// 최신 게시글 목록 조회
export const getLatestPosts = async (
    limit: number = 20,
    offset: number = 0
): Promise<any[]> => {
    const posts = await findLatestPosts(limit, offset);
    
    return posts.map(post => ({
        id: post.id,
        title: post.title,
        price: post.price,
        status: post.status,
        images: post.post_img.map(img => `/uploads/temp/${img.url}`),
        region: post.region ? 
            `${post.region.sido || ''} ${post.region.sigungu || ''}`.trim() : 
            '지역정보없음',
        createdAt: post.created_at,
        category: post.category?.category_name || '미분류',
        username: post.posting_user?.username || '알 수 없음'
    }));
}