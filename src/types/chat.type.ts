import type { TradeStatus } from "@prisma/client";

export interface CreateChatRoomRequest {
    postId: number;
    buyerId: number;
}

export interface TradeRequestData {
    tradeId: number;
    regionCode: string;
    addressDetail: string;
    amount: number;
    transactionType: 'IN_PERSON' | 'SHIPPING';
}

export interface TradeApprovalData {
    tradeId: number;
    messageId: number;
    approved: boolean;
}

export interface ChatRoomListItem {
    id: number;
    postId: number;
    postTitle: string;
    postImageUrl: string | null;
    otherUserId: number;
    otherUserName: string;
    lastMessage: string | null;
    lastMessageTime: Date | null;
    status: TradeStatus;
    updatedAt: Date;
}

export interface ChatMessage {
    id: number;
    senderId: number;
    senderName: string;
    content: string | null;
    messageType: string;
    imageUrl: string | null;
    createdAt: Date;
    tradeRequestInfo?: {
        regionCode: string;
        addressDetail: string;
        amount: number;
    };
}
