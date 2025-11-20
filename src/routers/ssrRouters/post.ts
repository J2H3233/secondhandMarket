import { Router } from 'express';
import { ssrCheckLoggedIn } from '../../middlewares/passport/auth.js';
import { ssrhandlerCreatePost, ssrhandlerGetPost } from '../../controllers/post.controller.js';
import { createPostSevice, getPost } from '../../services/post.service.js';
import { get } from 'http';


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
        title: '상품 등록 - 한성마켓',
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.userId ? { userId: req.session.userId } : null,
        additionalCSS: ['/css/posting.css'],
        showHeader: false // posting 페이지는 자체 헤더 사용
    });
});

// 게시글 생성 처리
router.post('/create', ssrCheckLoggedIn as any, ssrhandlerCreatePost as any
    // async (req, res) => {

    // try {
    //     const {
    //         title,
    //         content,
    //         price,
    //         delivery_charge,
    //         transaction_type,
    //         category_id,
    //         region_code
    //     } = req.body;
        
    //     // 간단한 유효성 검사
    //     if (!title || !content || !price || !transaction_type || !category_id || !region_code) {
    //         return res.render('posting', {
    //             title: '상품 등록 - 한성마켓',
    //             error: '필수 항목을 모두 입력해주세요.',
    //             isLogredIn: req.session.isLoggedIn || false,
    //             user: req.session.userId ? { userId: req.session.userId } : null
    //         });
    //     }
        
    //     // 게시글 생성 로직 (서비스 호출 등)
    //     const newPost = await createPostSevice(
    //         region_code,
    //         Number(req.session.userId),
    //         parseInt(price.replace(/,/g, '')),
    //         delivery_charge ? parseInt(delivery_charge) : 0,
    //         transaction_type as any,
    //         content,
    //         title
    //     );
        
    //     console.log('게시글 생성 데이터:', {
    //         title,
    //         content,
    //         price: parseInt(price.replace(/,/g, '')),
    //         delivery_charge: delivery_charge ? parseInt(delivery_charge) : 0,
    //         transaction_type,
    //         category_id: parseInt(category_id),
    //         region_code,
    //         posting_user_id: req.session.userId
    //     });
        
    //     res.redirect(`/${newPost.postId}`); 
        
    // } catch (error) {
    //     console.error('게시글 생성 오류:', error);
    //     res.render('posting', {
    //         title: '상품 등록 - 한성마켓',
    //         error: '게시글 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
    //         isLoggedIn: req.session.isLoggedIn || false,
    //         user: req.session.userId ? { userId: req.session.userId } : null
    //     });}
    // }
);

// 게시글 상세 조회
router.get('/:id', ssrhandlerGetPost as any);

export default router;
