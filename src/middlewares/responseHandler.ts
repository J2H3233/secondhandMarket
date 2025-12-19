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

    const httpStatus: number = code || res.statusCode || 200;

    return res.status(httpStatus).json({
      success: true,
      code: httpStatus,
      message: message,
      data: data,
    });
  };

  next();
};

export const successResponse = (data: any, message: string = '요청에 성공했습니다.') => {
  return {
    success: true,
    message: message,
    data: data,
  };
};

export const errorResponse = (message: string, code?: number) => {
  return {
    success: false,
    message: message,
    code: code,
  };
};