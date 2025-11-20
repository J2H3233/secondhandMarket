import type { NextFunction, Response } from "express";
import { CustomError, ErrorCodes } from "../../errors/customError.js"; 

export interface AuthenticatedRequest extends Request {
    session: {
        userId: string | number;
        isLoggedIn: boolean;
    };
}

export const checkLoggedIn = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        next(new CustomError(401, ErrorCodes.UNAUTHORIZED, '로그인이 필요합니다.'));
    }
}

export const ssrCheckLoggedIn = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}