import { Router } from 'express';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';

const router : Router = Router();

router.get('/',ssrCheckLoggedIn as any, (req, res) => {
    res.render('chatRoom', { 
        title: '채팅 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        additionalCSS: ['/css/chatRoom.css']
        // 레이아웃 사용 (기본값)
    });
});

export default router;