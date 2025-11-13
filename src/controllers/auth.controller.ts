import { signupUser, loginUser } from "../services/auth.service.js";
import type { Request, Response, NextFunction } from "express";
import type { SignupBody, LoginBody } from "../types/auth.types.js";



export const handlerSignup = async (req: Request<{},{},SignupBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { password, email, ...restOfBody } = req.body;

    try {
        const user = await signupUser({ password, email, ...restOfBody });
        res.jsonSuccess({ user }, '회원가입에 성공했습니다.', 201);
    } catch (error) {
        next(error);
    }
};

export const handlerLogin = async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await loginUser({ email, password });
        req.session.userId = user.userId as number;
        req.session.isLoggedIn = true as boolean; 

        res.jsonSuccess(user.userId, '로그인에 성공했습니다.', 200);
    } catch (error) {
        next(error);
    }
}

export const handlerLogout = (req: Request, res: Response, next: NextFunction) : void => {
    try {
        
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
        });
        res.jsonSuccess({}, '로그아웃에 성공했습니다.', 204);
    } catch (error) {
        next(error);
    }
}
