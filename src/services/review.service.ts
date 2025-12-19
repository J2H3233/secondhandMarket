import { CustomError, ErrorCodes } from '../errors/customError.js';
import { 
    createReview, 
    findReviewsByPostId, 
    countReviewsByPostId,
    findReviewByTradeRecordId,
    findReviewsByUserId,
    countReviewsByUserId
} from '../repositories/review.repository.js';
import { prisma } from '../config/db.config.js';

// 리뷰 작성
export const createReviewService = async (
    trade_record_id: number,
    post_id: number,
    buyer_id: number,
    rating: number,
    content: string
): Promise<any> => {
    // 거래 기록 확인
    const tradeRecord = await prisma.trade_record.findUnique({
        where: { id: trade_record_id },
        include: {
            trade: {
                include: {
                    post: true
                }
            }
        }
    });
    
    if (!tradeRecord) {
        throw new CustomError(404, ErrorCodes.RESOURCE_NOT_FOUND, '거래 기록을 찾을 수 없습니다.');
    }
    
    // 구매자 확인
    if (tradeRecord.trade.buyer_id !== buyer_id) {
        throw new CustomError(403, ErrorCodes.FORBIDDEN, '리뷰를 작성할 권한이 없습니다.');
    }
    
    // 이미 리뷰가 작성되었는지 확인
    const existingReview = await findReviewByTradeRecordId(trade_record_id);
    if (existingReview) {
        throw new CustomError(409, ErrorCodes.RESOURCE_ALREADY_EXISTS, '이미 리뷰가 작성되었습니다.');
    }
    
    // 평점 검증
    if (rating < 1 || rating > 5) {
        throw new CustomError(400, ErrorCodes.VALIDATION_FAILED, '평점은 1~5 사이여야 합니다.');
    }
    
    const review = await createReview(trade_record_id, post_id, rating, content);
    return review;
};

// 게시글의 리뷰 목록 조회
export const getReviewsByPost = async (
    post_id: number,
    page: number = 1,
    limit: number = 10
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [reviews, totalCount] = await Promise.all([
        findReviewsByPostId(post_id, limit, offset),
        countReviewsByPostId(post_id)
    ]);
    
    const formattedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        createdAt: review.created_at,
        buyerName: review.trade_record.trade.buyer.username,
        buyerId: review.trade_record.trade.buyer.id,
        images: review.review_img.map(img => img.url)
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        reviews: formattedReviews,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
};

// 사용자가 받은 리뷰 목록 조회
export const getUserReviews = async (
    user_id: number,
    page: number = 1,
    limit: number = 5
): Promise<any> => {
    const offset = (page - 1) * limit;
    const [reviews, totalCount] = await Promise.all([
        findReviewsByUserId(user_id, limit, offset),
        countReviewsByUserId(user_id)
    ]);
    
    console.log('getUserReviews - Raw data:', {
        user_id,
        reviewsCount: reviews.length,
        totalCount,
        reviews: reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            content: r.content,
            trade_record: r.trade_record
        }))
    });
    
    const formattedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        createdAt: review.created_at,
        buyerName: review.trade_record.trade.buyer.username,
        buyerId: review.trade_record.trade.buyer.id,
        postTitle: review.trade_record.trade.post.title,
        postId: review.trade_record.trade.post.id,
        images: review.review_img.map(img => img.url)
    }));
    
    // 평균 평점 계산
    const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
        : 0;
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        reviews: formattedReviews,
        totalCount,
        avgRating: Math.round(avgRating * 10) / 10,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    };
};
