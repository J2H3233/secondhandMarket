import { handlerSignup, handlerLogin, handlerLogout } from '../../controllers/auth.controller.js';
import { Router } from 'express'; 

const router : Router = Router(); 

router.post('/signup', handlerSignup);
router.post('/login', handlerLogin);
router.post('/logout', handlerLogout);

export default router;
