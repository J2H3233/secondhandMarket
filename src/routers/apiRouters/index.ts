import userRouter from './auth.js';
import { Router } from 'express'; 

const router : Router = Router(); 



router.use('/user', userRouter);

export default router;
