import { Router } from 'express'; 
import authRouter from './auth.js';
import regionRouter from './region.js';
import postRouter from './post.js';
import userRouter from './user.js';

const router : Router = Router(); 


router.use('/auth', authRouter);

router.use('/region', regionRouter);

router.use('/post', postRouter);

router.use('/user', userRouter);    

export default router;
