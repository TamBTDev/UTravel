import { Router } from "express";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { rateLimitConfig } from "@/middlewares/rateLimit.middleware";
import * as userController from "./user.controller";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get(
  "/profile",
  requireRole("USER", "ADMIN"),
  userController.getProfile,
);

userRouter.put(
  "/profile",
  rateLimitConfig.updateProfile,
  requireRole("USER", "ADMIN"),
  userController.updateProfile,
);

export default userRouter;
