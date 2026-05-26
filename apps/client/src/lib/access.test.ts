import { describe, it, expect } from "vitest";
import {
  canCreateBin,
  canMutateBin,
  canViewBin,
  permissionsFor,
  type AppUser,
} from "@strawhats/shared";

const leadDrEye: AppUser = {
  id: "1",
  email: "lead@example.com",
  name: "Lead",
  role: "lead",
  assignedProviders: ["Dr. Eye"],
};

const techDrEye: AppUser = {
  ...leadDrEye,
  id: "2",
  role: "technician",
  name: "Tech",
};

const techDrEye2: AppUser = {
  ...leadDrEye,
  id: "3",
  assignedProviders: ["Dr. Eye2"],
};

const kiosk: AppUser = {
  ...leadDrEye,
  id: "4",
  role: "kiosk",
  assignedProviders: [],
};

const binDrEye = { providerTags: ["Dr. Eye"] };
const binDrEye2 = { providerTags: ["Dr. Eye2"] };

describe("kit access", () => {
  it("lead can create kits only for assigned surgeons", () => {
    expect(canCreateBin(leadDrEye, ["Dr. Eye"])).toBe(true);
    expect(canCreateBin(leadDrEye, ["Dr. Eye2"])).toBe(false);
  });

  it("technician cannot create kits", () => {
    expect(canCreateBin(techDrEye, ["Dr. Eye"])).toBe(false);
  });

  it("technician can edit kits on their team", () => {
    expect(canMutateBin(techDrEye, binDrEye)).toBe(true);
    expect(canMutateBin(techDrEye, binDrEye2)).toBe(false);
  });

  it("kiosk can view but not mutate", () => {
    expect(canViewBin(kiosk, binDrEye2)).toBe(true);
    expect(canMutateBin(kiosk, binDrEye)).toBe(false);
    expect(permissionsFor(kiosk).scanOnly).toBe(true);
  });

  it("other team cannot edit unrelated surgeon kits", () => {
    expect(canMutateBin(techDrEye2, binDrEye)).toBe(false);
  });
});
