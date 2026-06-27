import type { NextFunction, Request, Response } from 'express';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimit = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      return res.status(429).json({ message: 'Too many requests' });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
};
