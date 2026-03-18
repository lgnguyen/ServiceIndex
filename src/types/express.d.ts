import type pino from "pino";

declare global {
  namespace Express {
    interface Request {
      /** Set when app is created with createApp({ logger }). Use for request-scoped logging in handlers. */
      log?: pino.Logger;
      /** Set by auth middleware after valid JWT. Handlers and validators use this for ownership checks. */
      userId?: string;
    }
  }
}

export {};
