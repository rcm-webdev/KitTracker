import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { prisma } from "../db/prisma";
import { normalizeRole, type UserRole } from "@kittracker/shared";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    assignedProviders: string[];
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

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      assignedProviders: true,
    },
  });

  if (!dbUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).user = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: normalizeRole(dbUser.role),
    assignedProviders: dbUser.assignedProviders ?? [],
  };
  (req as AuthenticatedRequest).session = session.session as AuthenticatedRequest["session"];
  next();
}
