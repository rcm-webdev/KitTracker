import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAdmin } from "../middleware/requireAdmin";
import { type AuthenticatedRequest } from "../middleware/requireAuth";
import type { AdminUser } from "@strawhats/shared";

const router = Router();

// GET /api/admin/users
router.get("/users", requireAdmin, async (_req, res) => {
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    email: string;
    name: string;
    role: string | null;
    banned: boolean | null;
    createdAt: Date;
    binCount: bigint;
    itemCount: bigint;
  }>>`
    SELECT
      u.id,
      u.email,
      u.name,
      u.role,
      u.banned,
      u."createdAt",
      COUNT(DISTINCT b.id) AS "binCount",
      COUNT(i.id)          AS "itemCount"
    FROM "user" u
    LEFT JOIN bins  b ON b."userId" = u.id
    LEFT JOIN items i ON i."binId" = b.id
    GROUP BY u.id
    ORDER BY u."createdAt" DESC
  `;

  const users: AdminUser[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as AdminUser["role"],
    banned: u.banned,
    createdAt: u.createdAt.toISOString(),
    binCount: Number(u.binCount),
    itemCount: Number(u.itemCount),
  }));

  res.json(users);
});

// POST /api/admin/users/:id/ban
router.post("/users/:id/ban", requireAdmin, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  if (id === user.id) {
    res.status(400).json({ error: "Cannot deactivate your own account" });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { banned: true, banReason: "Deactivated by admin" },
  });

  // Invalidate all active sessions for this user
  await prisma.session.deleteMany({ where: { userId: id } });

  res.json({ success: true });
});

// POST /api/admin/users/:id/unban
router.post("/users/:id/unban", requireAdmin, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  if (id === user.id) {
    res.status(400).json({ error: "Cannot reactivate your own account" });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { banned: false, banReason: null },
  });

  res.json({ success: true });
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  if (id === user.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Delete bins first (items cascade via Prisma onDelete: Cascade on Item.bin)
  await prisma.bin.deleteMany({ where: { userId: id } });
  // Delete user (Session and Account cascade via onDelete: Cascade)
  await prisma.user.delete({ where: { id } });

  res.status(204).send();
});

export default router;
