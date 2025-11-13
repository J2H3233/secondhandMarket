export {};

declare module 'express' {
    export interface Response {
        jsonSuccess: <T = any>(data?: T, message?: string, code?: number) => Response;
    }
}