import type { Request, Response, NextFunction } from "express";
import type { CreatePostRequestBody } from "../types/post.type.js";
import { createPostSevice, getPost, softdeletePostByIdService, getPostDetails } from "../services/post.service.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";


export const handlerCreatePost = async (req: Request<{}, {}, CreatePostRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { region_code, price, delivery_charge, transaction_type, content, title, category_name } = req.body;
    const userId = Number(req.session.userId);
    try {
        const newPost =  await createPostSevice(region_code, userId, price, delivery_charge, transaction_type as any, content, title, category_name);
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
    const { 
        region_code, 
        price, 
        delivery_charge, 
        transaction_type, 
        content, title, 
        category_name 
    } = req.body;
    const userId = Number(req.session.userId);
    try {
        const newPost =  await createPostSevice(region_code, userId, Number(price), Number(delivery_charge), transaction_type as any, content, title, category_name);
        res.redirect(`/post/${newPost.id}`);
    } catch (error) {
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
            showHeader: true,
            showFooter: true,
            additionalCSS: ['/css/postDetail.css']
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
