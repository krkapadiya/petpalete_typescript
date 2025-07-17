declare module "connect-multiparty" {
  import { RequestHandler } from "express";
  interface Options {
    uploadDir?: string;
    autoFiles?: boolean;
    autoFields?: boolean;
  }

  function multipart(opts?: Options): RequestHandler;
  export = multipart;
}
