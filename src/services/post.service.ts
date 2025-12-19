import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { createPost, findPostById, softdeletePostById, findPostDetailsById, findLatestPosts, findPostsByUserId, countPostsByUserId, findPostsByCategory, updatePost, searchPosts, countSearchPosts, countAllPosts, countPostsByCategory } from "../repositories/post.repository.js";
import type { PostTransactionType, PostStatus } from "@prisma/client";
import type { MulterFile } from "../types/image.types.js";

// 하드코딩: 주소를 지역코드로 변환
const convertAddressToRegionCode = (address: string): string => {
    // 입력값 정규화 (공백 제거, 소문자 변환)
    const normalized = address.replace(/\s+/g, '').toLowerCase();
    
    // 서울특별시 성북구 삼선동의 다양한 표현 지원
    const samseondongPatterns = [
        '서울특별시성북구삼선동',
        '서울성북구삼선동',
        '성북구삼선동',
        '삼선동'
    ];
    
    if (samseondongPatterns.some(pattern => normalized.includes(pattern.toLowerCase()))) {
        console.log(`주소 "${address}" -> 지역코드 1129010700 변환`);
        return '1129010700';
    }
    
    console.log(`주소 "${address}"는 변환되지 않음 (그대로 반환)`);
    return address; // 주소가 아니면 그대로 반환 (지역코드로 간주)
};


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

    // 주소를 지역코드로 변환 (하드코딩)
    const convertedRegionCode = convertAddressToRegionCode(region_code);

    const newPost = await prisma.$transaction(async (tx) => {
        const createdPost = await createPost(
            convertedRegionCode,
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

export const updatePostService = async (
    postId: number,
    userId: number,
    title: string,
    content: string,
    price: number,
    delivery_charge: number,
    transaction_type: PostTransactionType,
    category_name: string | undefined,
    status?: PostStatus
): Promise<any> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
    }
    
    // 권한 확인: 작성자만 수정 가능
    if (post.posting_user_id !== userId) {
        throw new CustomError(403, ErrorCodes.FORBIDDEN, '게시물을 수정할 권한이 없습니다.');
    }
    
    const updatedPost = await updatePost(
        postId,
        title,
        content,
        price,
        delivery_charge,
        transaction_type,
        category_name,
        status
    );
    
    return updatedPost;
}

// 타인이 볼 수 있는 사용자 게시글 목록 (공개용)// 게시글 검색
export const searchPostsService = async (
    searchQuery: string,
    page: number = 1,
    limit: number = 20
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [posts, totalCount] = await Promise.all([
        searchPosts(searchQuery, limit, offset),
        countSearchPosts(searchQuery)
    ]);
    
    const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        price: post.price,
        status: post.status,
        createdAt: post.created_at,
        images: post.post_img.map(img => `/uploads/temp/${img.url}`),
        region: `${post.region?.sido || ''} ${post.region?.sigungu || ''} ${post.region?.eubmyeonli || ''}`.trim() || '지역정보 없음',
        category: post.category?.category_name || '미분류',
        author: post.posting_user.username
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        posts: formattedPosts,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
};
export const getUserPublicPosts = async (
    userId: number,
    page: number = 1,
    limit: number = 12
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [posts, totalCount] = await Promise.all([
        findPostsByUserId(userId, limit, offset),
        countPostsByUserId(userId)
    ]);

    const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        price: post.price,
        status: post.status,
        createdAt: post.created_at,
        imageUrl: post.post_img[0]?.url || null,
        region: post.region ? `${post.region.sido || ''} ${post.region.sigungu || ''}`.trim() : '지역정보 없음',
        category: post.category?.category_name || '미분류'
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
        posts: formattedPosts,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
};

// 최신 게시글 목록 조회
export const getLatestPosts = async (
    page: number = 1,
    limit: number = 20
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [posts, totalCount] = await Promise.all([
        findLatestPosts(limit, offset),
        countAllPosts()
    ]);
    
    const formattedPosts = posts.map(post => ({
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
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        posts: formattedPosts,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
}

// 카테고리별 게시글 목록 조회
export const getPostsByCategory = async (
    categoryName: string,
    page: number = 1,
    limit: number = 20
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [posts, totalCount] = await Promise.all([
        findPostsByCategory(categoryName, limit, offset),
        countPostsByCategory(categoryName)
    ]);
    
    const formattedPosts = posts.map(post => ({
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
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        posts: formattedPosts,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
}

// 특정 사용자의 게시글 목록 조회
export const getUserPosts = async (
    userId: number,
    limit: number = 20,
    offset: number = 0
): Promise<any> => {
    const [posts, totalCount] = await Promise.all([
        findPostsByUserId(userId, limit, offset),
        countPostsByUserId(userId)
    ]);
    
    const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        price: post.price,
        status: post.status,
        imageUrl: post.post_img[0]?.url || null,
        region: post.region ? 
            `${post.region.sido || ''} ${post.region.sigungu || ''}`.trim() : 
            '지역정보없음',
        createdAt: post.created_at,
        category: post.category?.category_name || '미분류',
        username: post.posting_user?.username || '알 수 없음'
    }));
    
    return {
        posts: formattedPosts,
        totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount
    };
}