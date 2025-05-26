/*
  Warnings:

  - Added the required column `ownerId` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Mission_ownerId_idx" ON "Mission"("ownerId");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
