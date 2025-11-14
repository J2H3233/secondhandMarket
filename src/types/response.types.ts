
// type PaginationType = OffsetPagination | CursorPagination;

// export interface apiResponse<T = any> {
//     success: boolean;
//     data: T;
//     message: string;
//     code: string;
//     pagination?: PaginationType;
// }

// export interface OffsetPagination {
//     type: 'offset';
//     page: number;
//     pageSize: number;
//     totalItems: number;
//     totalPages: number;
// }

// export interface CursorPagination {
//     type: 'cursor'; 
//     pageSize: number; 
//     nextCursor?: string;
//     prevCursor?: string;
//     hasMore: boolean;
// }