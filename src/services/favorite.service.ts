import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import { addFavorite, removeFavorite, checkFavorite, getUserFavorites, getFavoriteCount } from "../repositories/favorite.repository.js";

// 찜하기/찜 취소 토글
export const toggleFavorite = async (userId: number, postId: number): Promise<{ isFavorited: boolean }> => {
    return await prisma.$transaction(async (tx) => {
        const isFavorite = await checkFavorite(userId, postId, tx);
        
        if (isFavorite) {
            // 이미 찜한 상태면 취소
            await removeFavorite(userId, postId, tx);
            return { isFavorited: false };
        } else {
            // 찜하지 않은 상태면 추가
            await addFavorite(userId, postId, tx);
            return { isFavorited: true };
        }
    });
};

// 사용자의 찜 목록 조회
export const getFavoriteList = async (userId: number, limit: number = 20, offset: number = 0): Promise<any[]> => {
    const favorites = await getUserFavorites(userId, limit, offset);
    
    return favorites.map(fav => ({
        postId: fav.post.id,
        title: fav.post.title,
        price: fav.post.price,
        status: fav.post.status,
        imageUrl: fav.post.post_img && fav.post.post_img.length > 0 && fav.post.post_img[0] ? fav.post.post_img[0].url : null,
        region: fav.post.region ? 
            `${fav.post.region.sido || ''} ${fav.post.region.sigungu || ''} ${fav.post.region.eubmyeonli || ''}`.trim() : 
            '지역정보없음',
        createdAt: fav.post.created_at,
        favoritedAt: fav.created_at
    }));
};

// 게시글의 찜 상태 및 찜 수 조회
export const getFavoriteStatus = async (userId: number | null, postId: number): Promise<{ isFavorited: boolean; favoriteCount: number }> => {
    const [isFavorite, favoriteCount] = await Promise.all([
        userId ? checkFavorite(userId, postId) : Promise.resolve(false),
        getFavoriteCount(postId)
    ]);
    
    return { isFavorited: isFavorite, favoriteCount };
};
