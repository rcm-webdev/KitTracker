import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";

const router = Router({ mergeParams: true });

// POST /api/bins/:id/items
router.post("/:id/items", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const bin = await prisma.bin.findFirst({
    where: { id: req.params.id, userId: user.id },
  });

  if (!bin) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  const item = await prisma.item.create({
    data: {
      binId: req.params.id,
      name: String(name),
      description: description ? String(description) : null,
    },
  });

  res.status(201).json(item);
});

// PUT /api/items/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, description } = req.body;

  const item = await prisma.item.findFirst({
    where: { id: req.params.id, bin: { userId: user.id } },
  });

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const updated = await prisma.item.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(description !== undefined && { description: description ? String(description) : null }),
    },
  });

  res.json(updated);
});

// DELETE /api/items/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const item = await prisma.item.findFirst({
    where: { id: req.params.id, bin: { userId: user.id } },
  });

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  await prisma.item.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
