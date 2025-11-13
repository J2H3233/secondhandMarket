// src/swagger/swagger.config.ts

import type { Options } from 'swagger-jsdoc';

// OpenAPI Specification (OAS)의 기본 정의
const swaggerDefinition = {
    openapi: '3.0.0', // OpenAPI 버전 (최신 권장)
    info: {
        title: 'SHM Secondhand Market API', // ⬅️ API 제목
        version: '1.0.0', // ⬅️ API 버전
        description: 'tsoa 없이 JSDoc을 사용하여 문서화된 중고 마켓 API입니다.',
    },
    servers: [
        {
            url: '/', // 서버 기본 경로 설정 (라우터에서 이 경로를 사용한다고 가정)
            description: '개발 서버',
        },
    ],
    // 보안 정의 (예: JWT 토큰 사용 시)
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT 토큰을 "Bearer {토큰}" 형식으로 입력해주세요.'
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const options: Options = {
    swaggerDefinition,
    // 💡 Swagger 주석을 스캔할 파일 경로
    // **주의:** 실제 실행 시점에는 컴파일된 JS 파일이 아닌, TS 파일을 스캔해야 합니다.
    // 현재 `tsx`로 바로 실행하므로 .ts 파일을 지정합니다.
    apis: ['./src/routers/**/*.ts', './src/controllers/*.ts', './src/models/*.ts'], 
};

export default options;