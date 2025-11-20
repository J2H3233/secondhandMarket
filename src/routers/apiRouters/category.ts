import { Router } from 'express'; 
import { handlerCreateCategory } from '../../controllers/category.controller.js';

const router : Router = Router();

router.post('/', handlerCreateCategory as any);

export default router;