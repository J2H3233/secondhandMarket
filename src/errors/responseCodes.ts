 export const ErrorCodes = Object.freeze({

    // 유효성 검사 관련
    VALIDATION_FAILED: 'VALIDATION_FAILED',      

    // 리소스 관련
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',


    // 인증 및 권한 관련
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // 데이터베이스 관련
    DB_OPERATION_FAILED: 'DB_OPERATION_FAILED',

    // 범용
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', 
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'

});

 export const SuccessCodes = Object.freeze({

    OK: 'OK',
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    DELETED: 'DELETED'
});