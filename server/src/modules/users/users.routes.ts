import { Router } from "express";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { rateLimitConfig } from "@/middlewares/rateLimit.middleware";
import * as userController from "./user.controller";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/profile", userController.getProfile);

userRouter.put(
  "/profile",
  rateLimitConfig.updateProfile,
  userController.updateProfile,
);

export default userRouter;
