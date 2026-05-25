import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";
import type { SearchResult } from "@strawhats/shared";

const router = Router();

// GET /api/search?q=<term>
router.get("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim() === "") {
    res.status(400).json({ error: "q query parameter is required" });
    return;
  }

  const items = await prisma.item.findMany({
    where: {
      name: { contains: q.trim(), mode: "insensitive" },
      bin: { userId: user.id },
    },
    include: {
      bin: { select: { id: true, name: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const results: SearchResult[] = items.map((item) => ({
    item: {
      id: item.id,
      binId: item.binId,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt.toISOString(),
    },
    binId: item.bin.id,
    binName: item.bin.name,
    binLocation: item.bin.location,
  }));

  res.json(results);
});

export default router;
