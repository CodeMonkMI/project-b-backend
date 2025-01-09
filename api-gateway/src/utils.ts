import axios from "axios";
import { Express, Request, Response } from "express";
import config from "./config.json";
import middlewares from "./middlewares";

const createHandler = (hostname: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostname}${path}`;
      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });
      console.log("url", url);
      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers: {
          ...req.headers,
        },
      });

      console.log(data);
      return res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        console.log(error.response);
        return res
          .status(error?.response?.status || 500)
          .json(error?.response?.data);
      }
      return res.status(500).json({ message: "Internal Server error!" });
    }
  };
};

const generateMiddlewares = (names: string[]) => {
  return names.map((name) => middlewares[name]);
};

export const configureRoutes = (app: Express) => {
  console.log("created routes");
  Object.entries(config.services).forEach(([name, service]) => {
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const endpoint = `/api${route.path}`;
        const hostname = service.url;
        const handler = createHandler(hostname, route.path, method);
        const requiredMiddlewares = generateMiddlewares(route.middlewares);

        console.log(`${endpoint} => ${method}`);
        app[method](endpoint, requiredMiddlewares, handler);
      });
    });
  });
};
