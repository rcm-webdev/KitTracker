import { CLINIC_PROVIDERS } from "./providers";

/** Demo lead tech — can create kits for all demo surgeons. */
export const DEMO_USER = {
  email: "clinic-lead@kittracker.clinic",
  password: "DemoPass123!",
  name: "Clinic Lead",
} as const;

/** Example technician on a single surgeon team (seed optional). */
export const DEMO_TECHNICIAN = {
  email: "eye1team@kittracker.clinic",
  password: "DemoPass123!",
  name: "Eye 1 Team Tech",
  assignedProviders: ["Dr. Eye"] as const,
} as const;

const OR_LOCATIONS = ["OR 1", "OR 2", "Prep Room", "Sterile Core"] as const;

const SAMPLE_SUPPLIES = [
  { name: "BSS", description: "Balanced salt solution" },
  { name: "Viscoelastic", description: "OVD" },
  { name: "Povidone-iodine", description: "Prep" },
  { name: "Sterile gauze", description: "4x4" },
  { name: "Eye drape", description: null },
] as const;

/** One procedure kit per surgeon, used by `prisma db seed`. */
export const DEMO_PROCEDURE_KITS = CLINIC_PROVIDERS.map((provider, index) => ({
  name: `${provider} — Procedure Kit`,
  location: OR_LOCATIONS[index % OR_LOCATIONS.length],
  description: `In-clinic supplies staged for ${provider}`,
  providerTags: [provider] as string[],
  items: SAMPLE_SUPPLIES.map((item) => ({ ...item })),
}));
