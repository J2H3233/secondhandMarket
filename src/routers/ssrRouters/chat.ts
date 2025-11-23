import { Router } from 'express';

const router : Router = Router();

router.get('/', (req, res) => {
    res.render('chatRoom', { 
        title: '채팅 - 한성마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null,
        additionalCSS: ['/css/chatRoom.css']
        // 레이아웃 사용 (기본값)
    });
});

export default router;