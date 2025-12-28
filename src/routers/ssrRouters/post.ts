import { Router } from 'express';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { ssrhandlerCreatePost, ssrhandlerGetPost } from '../../controllers/post.controller.js';
import { createPostSevice, getPost, getPostDetails } from '../../services/post.service.js';
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

// 게시글 수정 페이지
router.get('/:id/edit', ssrCheckLoggedIn as any, async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const userId = req.session.userId;
        
        const post = await getPostDetails(postId);
        
        // 권한 확인
        if (post.posting_user.id !== userId) {
            return res.status(403).send('수정 권한이 없습니다.');
        }
        
        res.render('postEdit', { 
            title: '게시글 수정 - 중고마켓',
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.userId ? { userId: req.session.userId } : null,
            post: post,
            additionalCSS: ['/css/posting.css']
        });
    } catch (error) {
        console.error('게시글 수정 페이지 로드 오류:', error);
        res.status(500).send('게시글을 불러올 수 없습니다.');
    }
});

export default router;
