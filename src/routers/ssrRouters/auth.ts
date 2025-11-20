import { Router } from 'express';
import { ssrhandlerLogin, ssrhandlerSignup, ssrhandlerLogout } from '../../controllers/auth.controller.js';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';

const router : Router = Router(); 


router.get('/login', (req, res) => {
    res.render('login', { 
        title: '로그인 - 한성마켓',
        showHeader: false,
        showFooter: false
    });
});

router.post('/login', ssrhandlerLogin as any);

router.get('/register', (req, res) => {
    res.render('register', { 
        title: '회원가입 - 한성마켓',
        showHeader: false,
        showFooter: false
    });
}); 

router.post('/register', ssrhandlerSignup as any);

router.post('/logout', ssrCheckLoggedIn as any, ssrhandlerLogout as any);

export default router;