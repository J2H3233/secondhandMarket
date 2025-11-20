import { prisma } from "../config/db.config.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";
import type { SessionUserInfo } from "../types/auth.types.js";
import { createPost, findPostById, softdeletePostById, findPostDetailsById } from "../repositories/post.repository.js";
import type { PostTransactionType } from "@prisma/client";
import type { MulterFile } from "../types/image.types.js";


export const createPostSevice = async (
    region_code: string,
    posting_user_id: number,
    price: number,
    delivery_charge: number,
    transaction_type: PostTransactionType,
    content: string,
    title: string,
    category_name: string | undefined,
    // image_files: MulterFile[]
): Promise<any> => {
    try {
        const newPost = await prisma.$transaction(async (tx) => {
            const createdPost = await createPost(
                region_code,
                posting_user_id,
                price,
                delivery_charge,
                transaction_type as PostTransactionType,
                content,
                title,
                category_name,
                tx
            );

            // const postId = createdPost.id;
            // if (image_files && image_files.length > 0) {
            //     // MulterFile 배열에서 DB에 저장할 경로 정보만 추출
            //     // 로컬 환경에서는 `path`나 `filename`을 사용하거나, 
            //     // 해당 파일에 접근 가능한 정적 URL을 조합하여 사용합니다.
            //     const filePaths = image_files.map(file => {
            //         // 서버의 정적 파일 서비스 URL을 가정 (예: http://yourserver/uploads/filename.jpg)
            //         // 실제 DB에 저장될 값은 클라이언트가 이미지를 불러올 수 있는 URL이 되어야 합니다.
            //         // Multer의 `filename`을 사용하거나 `path`를 사용해 DB 저장용 URL을 구성하세요.
                    
            //         // 여기서는 간단히 Multer가 저장한 파일 이름(filename)을 DB에 저장한다고 가정
            //         return file.filename; 
            //     }); 
                
            //     // DB에 저장: 게시물 ID와 로컬 파일 경로 배열을 사용하여 PostImage 레코드를 생성
            //     await createPostImages(postId, filePaths, tx); 
            // }

            // 이미지 업로드 로직 추가 예정
            return createdPost;
        });
        return newPost;
    } catch (error) {
        throw new CustomError(500, ErrorCodes.INTERNAL_SERVER_ERROR, '게시물 생성 중 오류 발생');
    }
}

const createPostImages = async (
    postId: number, 
    fileNames: string[], // MulterFile.filename 배열
    tx: any // Prisma.TransactionClient
): Promise<void> => {
    
    const dataToCreate = fileNames.map((fileName, index) => ({
        post_id: postId,
        // DB에 저장: 클라이언트가 접근할 수 있는 경로/파일명
        // 예: 'post_images/filename.jpg'. 이 경로 앞에 서버의 도메인이 붙어 최종 URL이 됩니다.
        url: fileName, 
        order: index + 1, 
    }));

    await tx.postImage.createMany({
        data: dataToCreate,
        skipDuplicates: true,
    });
}

export const getPost = async (id: number, tx?: any): Promise<any> => {
    const post = await findPostById(id, tx);
    if (!post) {
        throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
    }
    return post;     
}

export const getPostDetails = async (id: number): Promise<any> => {
    const postDetails = await prisma.$transaction(async (tx) => {
        const post = await findPostDetailsById(id, tx);
        if (!post) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
        }
        return post;
    });
    return postDetails;
}

export const softdeletePostByIdService = async (id: number): Promise<any> => {
    const deletedPost = await prisma.$transaction(async (tx) => {
        const post = await findPostById(id, tx);
        if (!post) {
            throw new CustomError(404, ErrorCodes.NOT_FOUND, '게시물을 찾을 수 없습니다.');
        }
        return await softdeletePostById(id, tx);
    });
    return deletedPost;
}