import { Router } from 'express';
import authRouter from './auth.js';
import postRouter from './post.js';

const router : Router = Router(); 

router.get('/', (req, res) => {
    res.render('index', { 
        title: '한성마켓 - 대학생 중고거래',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null,
        showHeader: false // 메인 페이지는 자체 헤더 사용
    });
});

router.use('/auth', authRouter);
router.use('/post', postRouter);


export default router;