import { Router } from "express";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { rateLimitConfig } from "@/middlewares/rateLimit.middleware";
import * as userController from "./user.controller";
import { getUserWallet, getUserWalletTransactions } from "./wallet.controller";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/profile", userController.getProfile);

userRouter.put(
  "/profile",
  rateLimitConfig.updateProfile,
  userController.updateProfile,
);

userRouter.post("/favorites", userController.toggleFavorite);
userRouter.get("/favorites", userController.getFavorites);
userRouter.post("/viewed", userController.addViewed);
userRouter.get("/viewed", userController.getViewed);

// Wallet routes
userRouter.get("/wallet", getUserWallet);
userRouter.get("/wallet/transactions", getUserWalletTransactions);

export default userRouter;
