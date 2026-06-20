import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import prisma from "../config/database";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication Middleware
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Token không tìm thấy",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

/**
 * Role-Based Authorization Middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Vui lòng xác thực",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Bạn không có quyền truy cập tài nguyên này",
      });
    }

    next();
  };
};

/**
 * Permission-Based Authorization Middleware for Manager
 */

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Vui lòng xác thực",
      });
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (req.user.role === "MANAGER") {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { permissions: true },
        });

        let perms: string[] = [];
        if (user?.permissions) {
          if (typeof user.permissions === "string") {
            perms = JSON.parse(user.permissions);
          } else {
            perms = user.permissions as string[];
          }
        }

        if (perms.includes(permission)) {
          return next();
        }
      } catch (e) {
        console.error("Error checking permissions:", e);
      }
    }

    return res.status(403).json({
      success: false,
      error: "Forbidden - Bạn không có quyền thực hiện thao tác này",
    });
  };
};
