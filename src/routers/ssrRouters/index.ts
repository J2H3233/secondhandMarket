import { Router } from 'express';
import authRouter from './auth.js';
import postRouter from './post.js';
import chatRouter from './chat.js';
import myshopRouter from './myshop.js';
import userRouter from './user.js';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { getLatestPosts, getPostsByCategory, searchPostsService } from '../../services/post.service.js';
import { getAllCategories } from '../../services/category.service.js';

const router : Router = Router(); 

router.get('/', async (req, res) => {
    try {
        const category = req.query.category as string;
        const page = parseInt(req.query.page as string) || 1;
        
        // 카테고리 목록 조회
        const categories = await getAllCategories();
        
        // 게시글 조회 (카테고리 필터링 및 페이지네이션 적용)
        let result;
        if (category) {
            result = await getPostsByCategory(category, page, 21);
        } else {
            result = await getLatestPosts(page, 21);
        }
        
        res.render('index', { 
            title: '중고마켓 - 대학생 중고거래',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { userId: req.session.userId } : null,
            posts: result.posts,
            categories: categories,
            selectedCategory: category || null,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                hasMore: result.hasMore,
                totalCount: result.totalCount
            }
        });
    } catch (error) {
        console.error('메인 페이지 게시글 조회 오류:', error);
        res.render('index', { 
            title: '중고마켓 - 대학생 중고거래',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { userId: req.session.userId } : null,
            posts: [],
            categories: [],
            selectedCategory: null,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                hasMore: false,
                totalCount: 0
            }
        });
    }
});

router.use('/auth', authRouter);
router.use('/post', postRouter);
router.use('/chat', chatRouter);
router.use('/myshop', ssrCheckLoggedIn as any, myshopRouter);
router.use('/user', userRouter);

// 검색 페이지
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.query as string || '';
        const page = parseInt(req.query.page as string) || 1;
        
        if (!searchQuery || searchQuery.trim() === '') {
            return res.redirect('/');
        }
        
        const result = await searchPostsService(searchQuery, page, 20);
        const categories = await getAllCategories();
        
        res.render('index', {
            title: `"${searchQuery}" 검색 결과 - 중고마켓`,
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? {
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            posts: result.posts,
            categories: categories,
            selectedCategory: null,
            searchQuery: searchQuery,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                hasMore: result.hasMore,
                totalCount: result.totalCount
            }
        });
    } catch (error) {
        console.error('검색 오류:', error);
        res.status(500).render('error', {
            title: '오류 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? {
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            message: '검색 중 오류가 발생했습니다.'
        });
    }
});

export default router;