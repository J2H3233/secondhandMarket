// fileUploads.ts (Multer 설정 파일)
import multer from 'multer';
import path from 'path';

type MulterCallback = (error: Error | null, acceptFile: boolean) => void;

// 저장소 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 이미지를 저장할 로컬 폴더 경로
        // 서버 시작 전에 이 폴더가 존재해야 합니다.
        cb(null, '../uploads/images'); 
    },
    filename: (req, file, cb) => {
        // 파일 이름 설정: "원본이름_타임스탬프.확장자" 형태로 저장
        const ext = path.extname(file.originalname); // 확장자 추출 (.jpg)
        const name = path.basename(file.originalname, ext); // 이름만 추출
        cb(null, name + '_' + Date.now() + ext); // 최종 파일 이름
    },
});

// Multer 미들웨어 인스턴스 생성
export const uploadImages = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 파일 크기 제한: 10MB
    },
    fileFilter: (req, file, cb: any) => {
        // 이미지 파일만 허용
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
    }
}).array('images', 10); // 'images'라는 필드명으로 최대 10개의 파일을 받음