import { Router } from "express";
import { permissionsFor } from "@strawhats/shared";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth";
import { toAppUser } from "../lib/kitAccess";

const router = Router();

// GET /api/me — role, surgeon assignments, and UI permissions
router.get("/", requireAuth, async (req, res) => {
  const appUser = toAppUser((req as AuthenticatedRequest).user);
  res.json({
    ...appUser,
    permissions: permissionsFor(appUser),
  });
});

export default router;
