import { Router } from 'express';
import authRouter from './auth.js';
import postRouter from './post.js';
import chatRouter from './chat.js';
import myshopRouter from './myshop.js';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';

const router : Router = Router(); 

router.get('/', (req, res) => {
    res.render('index', { 
        title: '중고마켓 - 대학생 중고거래',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null
        // 레이아웃 사용 (기본값)
    });
});

router.use('/auth', authRouter);
router.use('/post', postRouter);
router.use('/chat', chatRouter);
router.use('/myshop', ssrCheckLoggedIn as any, myshopRouter);

export default router;