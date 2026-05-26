import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";
import { toAppUser, canMutateBin } from "../lib/kitAccess";

const router = Router({ mergeParams: true });

async function findBinForMutation(binId: string, req: AuthenticatedRequest) {
  const appUser = toAppUser(req.user);
  const bin = await prisma.bin.findFirst({ where: { id: binId } });
  if (!bin || !canMutateBin(appUser, bin)) return null;
  return bin;
}

// POST /api/bins/:id/items
router.post("/:id/items", requireAuth, async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const bin = await findBinForMutation(req.params.id, req as AuthenticatedRequest);
  if (!bin) {
    res.status(403).json({ error: "You cannot edit supplies for this kit." });
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
  const { name, description } = req.body;
  const appUser = toAppUser((req as AuthenticatedRequest).user);

  const item = await prisma.item.findFirst({
    where: { id: req.params.id },
    include: { bin: true },
  });

  if (!item || !canMutateBin(appUser, item.bin)) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const updated = await prisma.item.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(description !== undefined && {
        description: description ? String(description) : null,
      }),
    },
  });

  res.json(updated);
});

// DELETE /api/items/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);

  const item = await prisma.item.findFirst({
    where: { id: req.params.id },
    include: { bin: true },
  });

  if (!item || !canMutateBin(appUser, item.bin)) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  await prisma.item.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
