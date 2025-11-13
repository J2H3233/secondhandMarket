import { signupUser, loginUser, logoutUser } from "../services/auth.service.js";
import type { Request, Response, NextFunction } from "express";
import type { SignupBody, LoginBody } from "../types/auth.types.js";



export const handlerSignup = async (req: Request<{},{},SignupBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { password, email, ...restOfBody } = req.body;

    try {
        const user = await signupUser({ password, email, ...restOfBody });
        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
};

export const handlerLogin = async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await loginUser({ email, password });
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}

export const handlerLogout = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        await logoutUser(req);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
