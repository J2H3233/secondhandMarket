import { Router } from 'express';
import { getUserInfo } from '../../services/auth.service.js';
import { getUserPublicPosts } from '../../services/post.service.js';
import { getUserTradeCount } from '../../services/trade.service.js';
import { getUserReviews } from '../../services/review.service.js';

const router: Router = Router();

// 사용자 프로필 페이지 (타인이 볼 수 있음)
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const page = parseInt(req.query.page as string) || 1;
        
        if (isNaN(userId)) {
            return res.status(400).send('잘못된 사용자 ID입니다.');
        }
        
        // 사용자 정보, 게시글 목록, 거래 건수, 리뷰 조회
        const [userInfo, postsData, tradeCount, reviewsData] = await Promise.all([
            getUserInfo(userId),
            getUserPublicPosts(userId, page, 5),
            getUserTradeCount(userId),
            getUserReviews(userId, 1, 5)
        ]);
        
        console.log('User Profile Data:', {
            userId,
            reviewsData: {
                totalCount: reviewsData.totalCount,
                avgRating: reviewsData.avgRating,
                reviewsLength: reviewsData.reviews.length,
                reviews: reviewsData.reviews
            }
        });
        
        res.render('userProfile', {
            title: `${userInfo.username}님의 상점 - 중고마켓`,
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? {
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            profileUser: {
                id: userInfo.id,
                username: userInfo.username,
                region: userInfo.region ? 
                    `${userInfo.region.sido || ''} ${userInfo.region.sigungu || ''} ${userInfo.region.eubmyeonli || ''}`.trim() :
                    '지역정보 없음'
            },
            posts: postsData.posts,
            pagination: {
                currentPage: postsData.currentPage,
                totalPages: postsData.totalPages,
                hasMore: postsData.hasMore,
                totalCount: postsData.totalCount
            },
            reviews: reviewsData.reviews,
            reviewStats: {
                totalCount: reviewsData.totalCount,
                avgRating: reviewsData.avgRating
            },
            tradeStats: tradeCount
        });
    } catch (error) {
        console.error('Error loading user profile:', error);
        res.status(404).render('error', {
            title: '오류 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? {
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            message: '사용자를 찾을 수 없습니다.'
        });
    }
});

export default router;
