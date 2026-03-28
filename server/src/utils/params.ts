import { Request } from 'express';

/** Extract a string param from req.params safely (Express 5 returns string | string[]) */
export function param(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

export function queryStr(req: Request, name: string): string | undefined {
  const val = req.query[name];
  if (typeof val === 'string') return val;
  return undefined;
}
