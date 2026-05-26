import { Router } from "express";
import { CLINIC_PROVIDERS } from "@strawhats/shared";
import { prisma } from "../db/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";
import {
  toAppUser,
  canCreateBin,
  canViewBin,
  canMutateBin,
} from "../lib/kitAccess";

const router = Router();

const ALLOWED_PROVIDERS = new Set<string>(CLINIC_PROVIDERS);

function parseProviderTags(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  const tags = [
    ...new Set(
      value
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0 && ALLOWED_PROVIDERS.has(tag))
    ),
  ];
  return tags;
}

function teamBinWhere(assignedProviders: string[]) {
  return {
    providerTags: { hasSome: assignedProviders },
  };
}

// GET /api/bins?location=&provider=
router.get("/", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);
  const { location, provider } = req.query;

  if (appUser.role === "kiosk") {
    res.json([]);
    return;
  }

  const where =
    appUser.role === "admin"
      ? {
          ...(location ? { location: String(location) } : {}),
          ...(provider
            ? { providerTags: { has: String(provider) } }
            : {}),
        }
      : {
          ...teamBinWhere(appUser.assignedProviders),
          ...(location ? { location: String(location) } : {}),
          ...(provider
            ? { providerTags: { has: String(provider) } }
            : {}),
        };

  const bins = await prisma.bin.findMany({
    where,
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  res.json(bins);
});

// GET /api/bins/providers — surgeons this user may tag kits with
router.get("/providers", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);

  if (appUser.role === "admin") {
    res.json([...CLINIC_PROVIDERS]);
    return;
  }

  const allowed = appUser.assignedProviders.filter((p) =>
    ALLOWED_PROVIDERS.has(p)
  );
  res.json(allowed);
});

// POST /api/bins — leads (and admins) only; tags must match team assignment
router.post("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const appUser = toAppUser(user);
  const { name, location, description, providerTags } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const tags = parseProviderTags(providerTags) ?? [];

  if (!canCreateBin(appUser, tags)) {
    res.status(403).json({
      error:
        "Only your team's lead can create kits, and only for assigned surgeons.",
    });
    return;
  }

  const bin = await prisma.bin.create({
    data: {
      userId: user.id,
      name: String(name),
      location: location ? String(location) : "Unassigned",
      description: description ? String(description) : null,
      providerTags: tags,
    },
    include: { items: true },
  });

  res.status(201).json(bin);
});

// GET /api/bins/:id
router.get("/:id", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);

  const bin = await prisma.bin.findFirst({
    where: { id: req.params.id },
    include: { items: true },
  });

  if (!bin || !canViewBin(appUser, bin)) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  res.json(bin);
});

// PUT /api/bins/:id
router.put("/:id", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);
  const { name, location, description, providerTags } = req.body;

  const existing = await prisma.bin.findFirst({
    where: { id: req.params.id },
  });

  if (!existing || !canMutateBin(appUser, existing)) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  const tags = parseProviderTags(providerTags);
  if (tags !== undefined && !canCreateBin(appUser, tags)) {
    res.status(403).json({
      error: "Cannot assign this kit to surgeons outside your team.",
    });
    return;
  }

  const bin = await prisma.bin.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(location !== undefined && { location: String(location) }),
      ...(description !== undefined && {
        description: description ? String(description) : null,
      }),
      ...(tags !== undefined && { providerTags: tags }),
    },
    include: { items: true },
  });

  res.json(bin);
});

// DELETE /api/bins/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);

  const existing = await prisma.bin.findFirst({
    where: { id: req.params.id },
  });

  if (!existing || !canMutateBin(appUser, existing)) {
    res.status(404).json({ error: "Bin not found" });
    return;
  }

  await prisma.bin.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
