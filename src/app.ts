import express from 'express';
import type { Request, Response } from 'express';

const app = express();

// Health check route so the server is demonstrably running
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Root route also returns 200 for convenience
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ data: 'Hello World!' });
});

export default app;
