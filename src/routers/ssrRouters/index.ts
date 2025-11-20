import { Router } from 'express';
import authRouter from './auth.js';
import postRouter from './post.js';

const router : Router = Router(); 

router.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home Page',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null
    });
});

router.use('/auth', authRouter);
router.use('/post', postRouter);


export default router;