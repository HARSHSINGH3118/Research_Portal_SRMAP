import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens";

/**
 * Middleware to protect routes and enforce role-based access.
 * @param roles - Optional array of allowed roles (e.g., ["author", "reviewer"])
 */
export const requireAuth = (roles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, message: "No token provided" });
    }

    try {
      const token = header.split(" ")[1];
      const payload = verifyAccessToken(token);

      // ✅ attach user info
      (req as any).user = payload;

      // ✅ role-based check
      if (roles && roles.length > 0) {
        const userRoles = Array.isArray(payload.roles) ? payload.roles : [];

        const hasRole = roles.some((r) => userRoles.includes(r));
        if (!hasRole) {
          return res.status(403).json({ ok: false, message: "Forbidden: insufficient role" });
        }
      }

      next();
    } catch (err) {
      console.error("Auth verification failed:", err);
      return res.status(401).json({ ok: false, message: "Invalid or expired token" });
    }
  };
};
