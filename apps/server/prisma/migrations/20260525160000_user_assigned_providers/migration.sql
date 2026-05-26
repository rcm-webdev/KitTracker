-- Team surgeon assignments for kit access control
ALTER TABLE "user" ADD COLUMN "assignedProviders" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
