import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // trade 테이블 확인
    const trades = await prisma.trade.findMany({
        take: 5,
        orderBy: { created_at: 'desc' }
    });
    console.log('=== Trade 테이블 (최근 5개) ===');
    console.log(trades);

    // message 테이블 확인 (모든 messageType 포함)
    const messages = await prisma.message.findMany({
        take: 20,
        orderBy: { created_at: 'desc' }
    });
    console.log('\n=== Message 테이블 (최근 20개) ===');
    messages.forEach(msg => {
        console.log(`ID: ${msg.id}, Type: ${msg.message_type}, Content: ${msg.content?.substring(0, 50)}`);
    });

    // 특정 trade의 메시지 확인 (첫번째 trade가 있다면)
    if (trades.length > 0) {
        const tradeId = trades[0].id;
        const tradeMessages = await prisma.message.findMany({
            where: { trade_id: tradeId },
            orderBy: { created_at: 'desc' }
        });
        console.log(`\n=== Trade ${tradeId}의 메시지들 ===`);
        tradeMessages.forEach(msg => {
            console.log(`ID: ${msg.id}, Type: ${msg.message_type}, Content: ${msg.content?.substring(0, 80)}`);
        });
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
