export type MulterFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string; // 로컬에 저장된 파일 이름
    path: string;     // 로컬에 저장된 파일의 전체 경로
    size: number;
};