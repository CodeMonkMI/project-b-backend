import axios from "axios";
import { Express, Request, Response } from "express";
import config from "./config.json";

const createHandler = (hostname: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      const url = `${hostname}${path}`;
      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers: {
          ...req.headers,
        },
      });
      return res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        return res
          .status(error?.response?.status || 500)
          .json(error?.response?.data);
      }
      return res.status(500).json({ message: "Internal Server error!" });
    }
  };
};

export const configureRoutes = (app: Express) => {
  console.log("created routes");
  Object.entries(config.services).forEach(([name, service]) => {
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        // todo add prefix for service name
        const endpoint = `/api/${name}${route.path}`;
        const hostname = service.url;
        const handler = createHandler(hostname, endpoint, method);
        console.log(`${method} - ${endpoint}`);
        app[method](endpoint, handler);
      });
    });
  });
};
