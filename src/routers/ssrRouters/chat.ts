import { Router } from 'express';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { getUserChatRooms } from '../../services/chat.service.js';

const router : Router = Router();

// 채팅 목록 페이지
router.get('/', ssrCheckLoggedIn as any, async (req, res) => {
    try {
        const userId = Number(req.session.userId);
        const chatRooms = await getUserChatRooms(userId);
        
        res.render('chatRoom', { 
            title: '채팅 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            additionalCSS: ['/css/chatRoom.css'],
            chatRooms: chatRooms,
            selectedRoomId: null
        });
    } catch (error) {
        console.error('채팅방 목록 조회 오류:', error);
        res.render('chatRoom', { 
            title: '채팅 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            additionalCSS: ['/css/chatRoom.css'],
            chatRooms: [],
            selectedRoomId: null
        });
    }
});

// 특정 채팅방으로 바로 이동
router.get('/:tradeId', ssrCheckLoggedIn as any, async (req, res) => {
    try {
        const userId = Number(req.session.userId);
        const tradeId = Number(req.params.tradeId);
        const chatRooms = await getUserChatRooms(userId);
        
        res.render('chatRoom', { 
            title: '채팅 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { 
                userId: req.session.userId,
                userName: req.session.userName || '사용자'
            } : null,
            additionalCSS: ['/css/chatRoom.css'],
            chatRooms: chatRooms,
            selectedRoomId: tradeId
        });
    } catch (error) {
        console.error('채팅방 조회 오류:', error);
        res.redirect('/chat');
    }
});

export default router;