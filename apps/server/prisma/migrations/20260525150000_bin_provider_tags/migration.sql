-- AlterTable
ALTER TABLE "bins" ADD COLUMN "providerTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
