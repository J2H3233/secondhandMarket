import { PrismaClient, Prisma } from '@prisma/client';

declare module 'express' {
    interface Response {
        // 성공 응답만 컨트롤러에서 직접 호출합니다.
        jsonSuccess: <T = any>(data?: T, message?: string, code?: number) => Response<any>;
    }
}

export type DBClient = PrismaClient | Prisma.TransactionClient;