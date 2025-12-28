import type { Request, Response, NextFunction } from "express";
import { toggleFavorite, getFavoriteList, getFavoriteStatus } from "../services/favorite.service.js";
import { CustomError, ErrorCodes } from "../errors/customError.js";

// 찜하기/찜 취소 토글
export const handleToggleFavorite = async (
    req: Request<{ postId: string }, {}, {}>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const postId = Number(req.params.postId);
        const userId = Number(req.session.userId);

        if (!userId) {
            throw new CustomError(401, ErrorCodes.UNAUTHORIZED, '로그인이 필요합니다.');
        }

        const result = await toggleFavorite(userId, postId);
        res.jsonSuccess(result, result.isFavorited ? '찜 목록에 추가되었습니다.' : '찜 목록에서 제거되었습니다.', 200);
    } catch (error) {
        next(error);
    }
};

// 사용자의 찜 목록 조회
export const handleGetFavorites = async (
    req: Request<{}, {}, {}, { limit?: string; offset?: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = Number(req.session.userId);
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const offset = req.query.offset ? Number(req.query.offset) : 0;

        if (!userId) {
            throw new CustomError(401, ErrorCodes.UNAUTHORIZED, '로그인이 필요합니다.');
        }

        const favorites = await getFavoriteList(userId, limit, offset);
        res.jsonSuccess(favorites, '찜 목록 조회에 성공했습니다.', 200);
    } catch (error) {
        next(error);
    }
};

// 게시글의 찜 상태 조회
export const handleGetFavoriteStatus = async (
    req: Request<{ postId: string }, {}, {}>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const postId = Number(req.params.postId);
        const userId = req.session.userId ? Number(req.session.userId) : null;

        const status = await getFavoriteStatus(userId, postId);
        res.jsonSuccess(status, '찜 상태 조회에 성공했습니다.', 200);
    } catch (error) {
        next(error);
    }
};
