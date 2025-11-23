import { Router } from 'express';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { ssrhandlerCreatePost, ssrhandlerGetPost } from '../../controllers/post.controller.js';
import { createPostSevice, getPost } from '../../services/post.service.js';
import { get } from 'http';
import upload from '../../middlewares/multer.js';

const router : Router = Router(); 

// router.get('/', ssrCheckLoggedIn as any, (req, res) => {
//     res.render('index', { 
//         title: 'Home Page',
//         isLoggedIn: req.session.isLoggedIn || false,
//         user: req.session.userId ? { userId: req.session.userId } : null
//     });
// });


// 게시글 작성 페이지
router.get('/new', ssrCheckLoggedIn as any, (req, res) => {
    res.render('posting', { 
        title: '상품 등록 - 중고마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null,
        additionalCSS: ['/css/posting.css']
        // 레이아웃 사용 (기본값)
    });
});

// 게시글 생성 처리
router.post('/create', 
    ssrCheckLoggedIn as any,
    (req, res, next) => {
        console.log('미들웨어 전 - Content-Type:', req.headers['content-type']);
        next();
    },
    upload.array('images', 5),
    (req, res, next) => {
        console.log('multer 후 - body:', req.body);
        console.log('multer 후 - files:', req.files);
        next();
    },
    ssrhandlerCreatePost as any
);

// 게시글 상세 조회
router.get('/:id', ssrhandlerGetPost as any);

export default router;
