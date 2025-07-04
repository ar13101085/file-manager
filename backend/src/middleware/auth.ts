import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { AuthError, GeneralError } from "../utils/errors";
import { SessionModel } from "../models/Session";
import { UserModel } from "../models/User";
import { AuthTokenPayload } from "../types/user.types";

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    userRole?: 'admin' | 'user';
    user?: any;
  }
}

export const requireAuth = async function (req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header (support both x-auth-token and Authorization Bearer)
    let token = req.header("x-auth-token");
    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // Check if no token
    if (!token) {
      throw new AuthError("Please login first to view this content.");
    }

    // Check if token is valid in session store
    const isValidSession = await SessionModel.isTokenValid(token);
    if (!isValidSession) {
      throw new AuthError("Invalid or expired session. Please login again.");
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "") as AuthTokenPayload;
    
    // Get user details
    const user = await UserModel.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AuthError("User account is disabled or not found.");
    }

    // Attach user info to request
    req.userId = payload.userId;
    req.userRole = payload.role;
    req.user = user;
    
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AuthError("Invalid token. Please login again."));
    } else {
      next(err);
    }
  }
};

export const requireAdmin = async function (req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    throw new GeneralError("Access denied. Admin privileges required.");
  }
  next();
};

export const requirePermission = (permission: keyof import("../types/user.types").UserPermissions) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AuthError("Authentication required.");
      }

      // Get path from request body or query
      const path = req.body.path || req.query.path || req.body.paths?.[0] || '';

      const hasPermission = await UserModel.hasPermission(userId, permission, path as string);
      if (!hasPermission) {
        throw new GeneralError(`Access denied. You don't have ${permission} permission.`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

// Legacy auth middleware for backward compatibility
export const auth = requireAuth;