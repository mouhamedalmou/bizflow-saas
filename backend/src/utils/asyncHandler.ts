import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

export default function asyncHandler<Params = ParamsDictionary, ResBody = unknown, ReqBody = unknown, Query = ParsedQs>(
  fn: (req: Request<Params, ResBody, ReqBody, Query>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => { Promise.resolve(fn(req as unknown as Request<Params, ResBody, ReqBody, Query>, res as Response<ResBody>, next)).catch(next); };
}
