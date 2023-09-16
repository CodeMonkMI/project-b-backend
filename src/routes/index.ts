import { Express, Request, Response } from "express";
import donationRequestRouter from "../DonationRequest/donationRequestRouter";
import authRouter from "../auth/authRouter";
import featuredRouter from "../featured/featuredRouter";

const routeArrays = [
  {
    path: "/api/v1/auth",
    handler: authRouter,
  },
  {
    path: "/api/v1/featured",
    handler: featuredRouter,
  },
  {
    path: "/api/v1/donation/requested",
    handler: donationRequestRouter,
  },
  {
    path: "/",
    handler: (req: Request, res: Response) => {
      return res.status(200).json({
        message: "You are good to go",
      });
    },
  },
];

const setRoutes = (app: Express) => {
  routeArrays.forEach((route) => {
    if (route.path === "/") {
      app.get(route.path, route.handler);
    } else {
      app.use(route.path, route.handler);
    }
  });
};

export default setRoutes;
