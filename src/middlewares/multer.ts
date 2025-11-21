import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';


const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = 'uploads/temp';
        fs.mkdirSync(uploadPath, { recursive: true }); 
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname); 
        cb(null, path.basename(file.originalname, ext) + Date.now() + uuidv4() + ext); 
    },
});

const fileFilter = (req: any, file : any, cb : any) => {
    // MIME 타입 확인
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // 파일 허용
    } else {
        cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false); // 파일 거부
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한: 5MB
});

export default upload;