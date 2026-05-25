import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";

const router = Router();

// GET /api/bins
router.get("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { location } = req.query;

  const bins = await prisma.bin.findMany({
    where: {
      userId: user.id,
      ...(location ? { location: String(location) } : {}),
    },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  res.json(bins);
});

// POST /api/bins
router.post("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, location, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const bin = await prisma.bin.create({
    data: {
      userId: user.id,
      name: String(name),
      location: location ? String(location) : "Unassigned",
      description: description ? String(description) : null,
    },
  });

  res.status(201).json(bin);
});

// GET /api/bins/:id
router.get("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const bin = await prisma.bin.findFirst({
    where: { id: req.params.id, userId: user.id },
    include: { items: true },
  });

  if (!bin) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  res.json(bin);
});

// PUT /api/bins/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, location, description } = req.body;

  const existing = await prisma.bin.findFirst({
    where: { id: req.params.id, userId: user.id },
  });

  if (!existing) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  const bin = await prisma.bin.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(location !== undefined && { location: String(location) }),
      ...(description !== undefined && { description: description ? String(description) : null }),
    },
  });

  res.json(bin);
});

// DELETE /api/bins/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const existing = await prisma.bin.findFirst({
    where: { id: req.params.id, userId: user.id },
  });

  if (!existing) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  await prisma.bin.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
