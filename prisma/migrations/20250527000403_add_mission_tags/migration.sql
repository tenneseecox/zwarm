-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
