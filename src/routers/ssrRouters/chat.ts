import { Router } from 'express';

const router : Router = Router();

router.get('/chat', (req, res) => {
    res.render('chatRoom', { 
        title: '채팅 - 한성마켓',
    });
});

export default router;