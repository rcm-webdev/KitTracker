import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { AuthenticatedRequest } from "./requireAuth";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  });

  if (!session || !session.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (session.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  (req as AuthenticatedRequest).user = session.user as AuthenticatedRequest["user"];
  (req as AuthenticatedRequest).session = session.session as AuthenticatedRequest["session"];
  next();
}
