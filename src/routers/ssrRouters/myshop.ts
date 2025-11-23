import { Router } from 'express';

const router : Router = Router();

// 마이샵 메인 페이지
router.get('/', (req, res) => {
    res.render('myshop', { 
        title: '내 상점 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'main',
        sectionTitle: '내 상점'
    });
});

// 내 정보 수정
router.get('/info', (req, res) => {
    res.render('myshop', { 
        title: '내 정보 수정 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'info',
        sectionTitle: '내 정보 수정'
    });
});

// 내 게시글 목록
router.get('/posts', (req, res) => {
    res.render('myshop', { 
        title: '내 게시글 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'posts',
        sectionTitle: '내 게시글 목록'
    });
});

// 찜 게시글 목록
router.get('/likes', (req, res) => {
    res.render('myshop', { 
        title: '찜 게시글 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'likes',
        sectionTitle: '찜 게시글 목록'
    });
});

// 거래내역
router.get('/history', (req, res) => {
    res.render('myshop', { 
        title: '거래내역 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'history',
        sectionTitle: '거래내역'
    });
});

// 리뷰내역
router.get('/reviews', (req, res) => {
    res.render('myshop', { 
        title: '리뷰내역 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { 
            userId: req.session.userId,
            userName: req.session.userName || '사용자'
        } : null,
        currentPage: 'reviews',
        sectionTitle: '리뷰내역'
    });
});

export default router;
