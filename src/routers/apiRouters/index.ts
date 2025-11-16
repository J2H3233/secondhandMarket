import { Router } from 'express'; 
import authRouter from './auth.js';
import regionRouter from './region.js';


const router : Router = Router(); 



router.use('/auth', authRouter);
router.use('/region', regionRouter);

export default router;
