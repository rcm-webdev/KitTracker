/** Canonical surgeon list for procedure kit provider tags and dashboard filters. */
export const CLINIC_PROVIDERS = [
  "Dr. Eye",
  "Dr. Eye2",
  "Dr. Eye3",
  "Dr. Eye4",
  "Dr. Eye5",
  "Dr. Eye6",
  "Dr. Eye7",
  "Dr. Eye8",
] as const;

export type ClinicProvider = (typeof CLINIC_PROVIDERS)[number];
