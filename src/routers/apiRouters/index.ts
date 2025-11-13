import authRouter from './auth.js';
import { Router } from 'express'; 

const router : Router = Router(); 



router.use('/auth', authRouter);

export default router;
