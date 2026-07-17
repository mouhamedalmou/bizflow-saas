import type { IUser } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Multer.File;
    }
  }
}

export {};
