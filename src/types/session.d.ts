declare module 'express-session' {
  interface SessionData {

    userId?: number;
    isLoggedIn?: boolean;
  }
}

export {}; 