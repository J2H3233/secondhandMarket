import { findTradesByBuyerId, findTradesBySellerId, countTradesByBuyerId, countTradesBySellerId } from '../repositories/trade.repository.js';

// 사용자의 거래 내역 조회 (구매 + 판매)
export const getUserTrades = async (
    userId: number,
    limit: number = 20,
    offset: number = 0
): Promise<any> => {
    const [buyTrades, sellTrades, buyCount, sellCount] = await Promise.all([
        findTradesByBuyerId(userId, limit, offset),
        findTradesBySellerId(userId, limit, offset),
        countTradesByBuyerId(userId),
        countTradesBySellerId(userId)
    ]);

    // 구매 내역 포맷팅
    const formattedBuyTrades = buyTrades.map(trade => ({
        id: trade.id,
        type: 'buy',
        postId: trade.post.id,
        postTitle: trade.post.title,
        price: trade.post.price,
        imageUrl: trade.post.post_img[0]?.url || null,
        partnerName: trade.seller.username,
        partnerId: trade.seller.id,
        status: trade.status,
        createdAt: trade.created_at,
        completedAt: trade.trade_record[0]?.created_at || null,
        tradeRecordId: trade.trade_record[0]?.id || null
    }));

    // 판매 내역 포맷팅
    const formattedSellTrades = sellTrades.map(trade => ({
        id: trade.id,
        type: 'sell',
        postId: trade.post.id,
        postTitle: trade.post.title,
        price: trade.post.price,
        imageUrl: trade.post.post_img[0]?.url || null,
        partnerName: trade.buyer.username,
        partnerId: trade.buyer.id,
        status: trade.status,
        createdAt: trade.created_at,
        completedAt: trade.trade_record[0]?.created_at || null,
        tradeRecordId: trade.trade_record[0]?.id || null
    }));

    // 모든 거래를 합쳐서 날짜순 정렬
    const allTrades = [...formattedBuyTrades, ...formattedSellTrades]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
        trades: allTrades,
        buyCount,
        sellCount,
        totalCount: buyCount + sellCount
    };
};

// 사용자의 거래 건수만 조회
export const getUserTradeCount = async (userId: number): Promise<{
    buyCount: number;
    sellCount: number;
    totalCount: number;
}> => {
    const [buyCount, sellCount] = await Promise.all([
        countTradesByBuyerId(userId),
        countTradesBySellerId(userId)
    ]);

    return {
        buyCount,
        sellCount,
        totalCount: buyCount + sellCount
    };
};
