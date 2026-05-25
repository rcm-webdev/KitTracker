import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session: {
    id: string;
  };
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).user = session.user as AuthenticatedRequest["user"];
  (req as AuthenticatedRequest).session = session.session as AuthenticatedRequest["session"];
  next();
}
