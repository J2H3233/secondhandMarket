import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/customError.js';

export const errorHandler = (
    err: CustomError, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {

    console.error(err.stack);

    const httpStatus: number = err.httpStatus || 500;

    res.status(httpStatus).json({
        code: httpStatus,
        message: err.message || '서버 오류', 
    });

};