import { Router } from 'express';
import authRouter from './auth.js';
import postRouter from './post.js';
import chatRouter from './chat.js';
import myshopRouter from './myshop.js';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { getLatestPosts } from '../../services/post.service.js';

const router : Router = Router(); 

router.get('/', async (req, res) => {
    try {
        // 최신 게시글 20개 조회
        const posts = await getLatestPosts(20, 0);
        
        res.render('index', { 
            title: '중고마켓 - 대학생 중고거래',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { userId: req.session.userId } : null,
            posts: posts
        });
    } catch (error) {
        console.error('메인 페이지 게시글 조회 오류:', error);
        res.render('index', { 
            title: '중고마켓 - 대학생 중고거래',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { userId: req.session.userId } : null,
            posts: []
        });
    }
});

router.use('/auth', authRouter);
router.use('/post', postRouter);
router.use('/chat', chatRouter);
router.use('/myshop', ssrCheckLoggedIn as any, myshopRouter);

export default router;