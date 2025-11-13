import type { NextFunction, Request, Response } from 'express';

export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (res as any).jsonSuccess = (
    data: any,
    message: string = '요청에 성공했습니다.',
    code: number,
  ) => {

    const httpStatus: number = res.statusCode || 200;

    return res.status(httpStatus).json({
      code: code,
      message: message,
      result: data,
    });
  };

  next();
};