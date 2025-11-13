import dotenv from 'dotenv';
// 필요한 Prisma 네임스페이스를 가져옵니다.
import { PrismaClient, Prisma } from "@prisma/client"; 

dotenv.config();

const prisma = new PrismaClient<{
    log: [
        {
            emit: 'event',
            level: 'query'
        },
    ]
}>({
    log: [
        {
            emit: 'event',
            level: 'query'
        },
    ]
});


prisma.$on('query', (event: Prisma.QueryEvent) => {
    console.log(`[PRISMA/DB] ${event.duration}ms | SQL: ${event.query.slice(0, 100)}...`);
});

export { prisma };