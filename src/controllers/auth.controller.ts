import { signupUser, loginUser } from "../services/auth.service.js";
import type { Request, Response, NextFunction } from "express";
import type { SignupRequestBody, LoginRequestBody} from "../types/auth.types.js";



export const handlerSignup = async (req: Request<{},{},SignupRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { password, email, ...restOfBody } = req.body;

    try {
        const user = await signupUser({ password, email, ...restOfBody });
        res.jsonSuccess({ user }, '회원가입에 성공했습니다.', 201);
    } catch (error) {
        next(error);
    }
};

export const handlerLogin = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await loginUser({ email, password });
        req.session.userId = user.userId as number;
        req.session.userName = user.userName as string;
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


export const ssrhandlerLogin = async (req: Request<{},{}, LoginRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { email, password } = req.body;
    
    try {
        const user = await loginUser({ email, password });

        req.session.userId = user.userId as number;
        req.session.userName = user.userName as string;
        req.session.isLoggedIn = true as boolean;
        
        res.redirect('/');

    } catch (error : any) {
        res.render('login', { 
            title: 'Login Page',
            error: error.message || '로그인 중 오류가 발생했습니다.'
        });
    }
};

export const ssrhandlerSignup = async (req: Request<{},{}, SignupRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone_num: req.body.phone_num,
        region_code: req.body.region_code,
        address_detail: req.body.address_detail
    };
    
    try {
        await signupUser(userData as SignupRequestBody);
        res.redirect('/auth/login');
    } catch (error: any) {
        res.render('register', { 
            title: 'Register Page',
            error: error.message || '회원가입 중 오류가 발생했습니다.'
        });
    }
};

export const ssrhandlerLogout = (req: Request, res: Response, next: NextFunction) : void => {
    req.session.destroy((err) => {
        if (err) {
            console.error('세션 삭제 중 오류:', err);
        }
        res.redirect('/');
    });
};
            