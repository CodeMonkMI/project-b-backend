import { RequestHandler } from "express";
import { CONTROLLER_MIDDLEWARE_KEY, MIDDLEWARE_KEY } from "./decorator.keys";

export function Use(middleware: RequestHandler | RequestHandler[]) {
  return function (target: any, propertyKey?: string | symbol) {
    const middlewares = Array.isArray(middleware) ? middleware : [middleware];
    if (propertyKey && typeof propertyKey === "string") {
      // method level middleware
      const existedMiddlewares = Reflect.getMetadata(
        MIDDLEWARE_KEY,
        target,
        propertyKey
      );
      const combinedMiddleware = [...existedMiddlewares, ...middlewares];
      Reflect.defineMetadata(
        MIDDLEWARE_KEY,
        combinedMiddleware,
        target,
        propertyKey
      );
      return;
    }
    // class level middleware
    const existedMiddlewares = Reflect.getMetadata(
      CONTROLLER_MIDDLEWARE_KEY,
      target
    );
    const combinedMiddleware = [...existedMiddlewares, ...middlewares];
    Reflect.defineMetadata(
      CONTROLLER_MIDDLEWARE_KEY,
      combinedMiddleware,
      target
    );
  };
}
