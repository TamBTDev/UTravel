import { Router } from "express";
import { rateLimitConfig } from "@/middlewares/rateLimit.middleware";
import * as authController from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", rateLimitConfig.register, authController.register);

authRouter.post(
  "/register/verify-otp",
  rateLimitConfig.verifyOtp,
  authController.verifyRegisterOtp,
);

authRouter.post(
  "/register/resend-otp",
  rateLimitConfig.sendOtp,
  authController.resendRegisterOtp,
);

authRouter.post("/login", rateLimitConfig.login, authController.login);

authRouter.post(
  "/forgot-password",
  rateLimitConfig.sendOtp,
  authController.forgotPassword,
);

authRouter.post(
  "/reset-password",
  rateLimitConfig.verifyOtp,
  authController.resetPassword,
);

authRouter.post("/verify-token", authController.verifyToken);

authRouter.post("/refresh-token", authController.refreshToken);

authRouter.post("/logout", authController.logout);

export default authRouter;
