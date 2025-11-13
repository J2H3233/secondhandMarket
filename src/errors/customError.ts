import { ErrorCodes } from './responseCodes.js';

class CustomError extends Error {

    readonly code: string;
    readonly httpStatus: number;

    constructor(httpStatus : number = 500, code : string,  message: string = '알 수 없는 오류가 발생했습니다.') {
        super(message);

        this.code = code || ErrorCodes.UNKNOWN_ERROR;
        this.httpStatus = httpStatus;

    }
}

export { CustomError, ErrorCodes };