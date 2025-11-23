declare module 'express-session' {
  interface SessionData {

    userId?: number;
    userName?: string;
    isLoggedIn?: boolean;
  }
}

export {}; 