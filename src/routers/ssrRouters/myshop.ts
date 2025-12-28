import { Router } from 'express';
import { getFavoriteList } from '../../services/favorite.service.js';
import { getUserPosts } from '../../services/post.service.js';
import { getUserTrades } from '../../services/trade.service.js';
import { getUserInfo, updateUserInfo } from '../../services/auth.service.js';
import { getUserReviews } from '../../services/review.service.js';

const router : Router = Router();

// 마이샵 메인 페이지 - 내 정보 수정으로 리다이렉트
router.get('/', (req, res) => {
    res.redirect('/myshop/info');
});

// 내 정보 수정
router.get('/info', async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        const userInfo = await getUserInfo(userId);
        
        res.render('myshop', { 
            title: '내 정보 수정 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'info',
            sectionTitle: '내 정보 수정',
            userInfo: userInfo
        });
    } catch (error) {
        console.error('Error loading user info:', error);
        res.render('myshop', { 
            title: '내 정보 수정 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'info',
            sectionTitle: '내 정보 수정',
            userInfo: null
        });
    }
});

// 내 게시글 목록
router.get('/posts', async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const result = await getUserPosts(userId, limit, offset);
        
        res.render('myshop', { 
            title: '내 게시글 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'posts',
            sectionTitle: '내 게시글 목록',
            posts: result.posts || [],
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                hasMore: result.hasMore
            }
        });
    } catch (error) {
        console.error('Error loading user posts:', error);
        res.render('myshop', { 
            title: '내 게시글 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'posts',
            sectionTitle: '내 게시글 목록',
            posts: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
                hasMore: false
            }
        });
    }
});

// 찜 게시글 목록
router.get('/likes', async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        const favorites = await getFavoriteList(userId, 100, 0);
        
        res.render('myshop', { 
            title: '찜 게시글 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'likes',
            sectionTitle: '찜 게시글 목록',
            favorites: favorites || []
        });
    } catch (error) {
        console.error('Error loading favorites:', error);
        res.render('myshop', { 
            title: '찜 게시글 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'likes',
            sectionTitle: '찜 게시글 목록',
            favorites: []
        });
    }
});

// 거래내역
router.get('/history', async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        const result = await getUserTrades(userId, 100, 0);
        
        res.render('myshop', { 
            title: '거래내역 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'history',
            sectionTitle: '거래내역',
            trades: result.trades || [],
            tradeStats: {
                buyCount: result.buyCount,
                sellCount: result.sellCount,
                totalCount: result.totalCount
            }
        });
    } catch (error) {
        console.error('Error loading trade history:', error);
        res.render('myshop', { 
            title: '거래내역 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'history',
            sectionTitle: '거래내역',
            trades: [],
            tradeStats: {
                buyCount: 0,
                sellCount: 0,
                totalCount: 0
            }
        });
    }
});

// 리뷰내역
router.get('/reviews', async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        const page = parseInt(req.query.page as string) || 1;
        const reviewsData = await getUserReviews(userId, page, 10);
        
        res.render('myshop', { 
            title: '리뷰내역 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'reviews',
            sectionTitle: '리뷰내역',
            reviews: reviewsData.reviews || [],
            reviewStats: {
                totalCount: reviewsData.totalCount,
                avgRating: reviewsData.avgRating
            },
            pagination: {
                currentPage: reviewsData.currentPage,
                totalPages: reviewsData.totalPages,
                hasMore: reviewsData.hasMore
            }
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.render('myshop', { 
            title: '리뷰내역 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            currentPage: 'reviews',
            sectionTitle: '리뷰내역',
            reviews: [],
            reviewStats: {
                totalCount: 0,
                avgRating: 0
            },
            pagination: {
                currentPage: 1,
                totalPages: 1,
                hasMore: false
            }
        });
    }
});

export default router;
