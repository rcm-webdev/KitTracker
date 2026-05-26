import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

// GET /api/public/bins/:id — no auth; for QR scans on clinic tablets
router.get("/:id", async (req, res) => {
  const bin = await prisma.bin.findUnique({
    where: { id: req.params.id },
    include: { items: { orderBy: { name: "asc" } } },
  });

  if (!bin) {
    res.status(404).json({ error: "Kit not found" });
    return;
  }

  const { userId: _userId, ...publicBin } = bin;
  res.json(publicBin);
});

export default router;
