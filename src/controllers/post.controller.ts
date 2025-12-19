import type { Request, Response, NextFunction } from "express";
import type { CreatePostRequestBody } from "../types/post.type.js";
import { createPostSevice, getPost, softdeletePostByIdService, getPostDetails, getLatestPosts } from "../services/post.service.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";


export const handlerCreatePost = async (req: Request<{}, {}, CreatePostRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { region_code, price, delivery_charge, transaction_type, content, title, category_name } = req.body;
    const userId = Number(req.session.userId);
    try {
        const newPost =  await createPostSevice(region_code, userId, price, delivery_charge, transaction_type as any, content, title, category_name, []);
        res.jsonSuccess(newPost, '게시글 생성에 성공했습니다.', 201);
    } catch (error) {
        next(error);
    }
}

export const handlerGetPost = async (req: Request<{ id: number }, {}, {}>, res: Response, next: NextFunction) : Promise<void> => {
    const postId = Number(req.params.id);
    try{
        const post = await getPostDetails(postId);
        res.jsonSuccess(post, '게시물 조회에 성공했습니다.', 200);
    }catch(error){
        next(error);
    }
}

export const handlerSoftDeletePost = async (req: Request<{ id: number }, {}, {}>, res: Response, next: NextFunction) : Promise<void> => {
    const postId = Number(req.params.id);
    try{
        const deletedPost = await softdeletePostByIdService(postId);
        res.jsonSuccess(deletedPost, '게시물 삭제에 성공했습니다.', 200);
    }catch(error){
        next(error);
    }
}





export const ssrhandlerCreatePost = async (req: Request<{},{}, CreatePostRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    
    console.log('=== 디버깅 정보 ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.is multipart:', req.is('multipart/form-data'));
    
    // body가 undefined인 경우 처리
    if (!req.body) {
        console.error('req.body가 undefined입니다.');
        return res.redirect('/post/new?error=invalid_form_data');
    }

    const { 
        region_code, 
        price, 
        delivery_charge, 
        transaction_type, 
        content, 
        title, 
        category_name 
    } = req.body;

    // 필수 필드 검증
    if (!title || !content || !price || !region_code || !transaction_type || !category_name) {
        console.error('필수 필드가 누락되었습니다:', { title, content, price, region_code, transaction_type, category_name });
        return res.redirect('/post/new?error=missing_required_fields');
    }

    const images = req.files as Express.Multer.File[];
    const userId = Number(req.session.userId);
    
    try {
        const newPost = await createPostSevice(
            region_code, 
            userId, 
            Number(price), 
            Number(delivery_charge), 
            transaction_type as any, 
            content, 
            title, 
            category_name, 
            images || []
        );
        res.redirect(`/post/${newPost.id}`);
    } catch (error) {
        console.error('게시글 생성 오류:', error);
        res.redirect('/post/new?error=failed_to_create');
    }
}

export const ssrhandlerGetPost = async (req: Request<{ id: number }, {}, {}>, res: Response, next: NextFunction) : Promise<void> => {
    const postId = Number(req.params.id);   
    try{
        const post = await getPostDetails(postId);
                console.log('Post data:', JSON.stringify(post, null, 2));
        if (!post) {
            return res.status(404).render('error', { 
                title: '페이지를 찾을 수 없음',
                message: '존재하지 않는 게시물입니다.',
                showHeader: true,
                showFooter: true 
            });
        }

        res.render('postDetail', {
            title: post.title as string,
            post: post, 
            user: req.session.userId ? { userId: req.session.userId } : null,
            isLoggedIn: req.session.isLoggedIn || false,
            additionalCSS: ['/css/postDetail.css']
            // 레이아웃 사용 (기본값)
        });
    }catch(error){
        console.error('게시물 조회 오류:', error);
        res.status(500).render('error', { 
            title: '서버 오류',
            message: '게시물을 불러오는 중 오류가 발생했습니다.',
            showHeader: true,
            showFooter: true 
        });
    }
}

// API: 게시글 목록 조회 (페이징 지원)
export const handlerGetPosts = async (
    req: Request<{}, {}, {}, { limit?: string; offset?: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 21;
        const offset = req.query.offset ? Number(req.query.offset) : 0;
        
        const posts = await getLatestPosts(limit, offset);
        res.jsonSuccess(posts, '게시글 목록 조회에 성공했습니다.', 200);
    } catch (error) {
        next(error);
    }
}
