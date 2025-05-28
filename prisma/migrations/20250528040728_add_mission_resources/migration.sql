-- CreateTable
CREATE TABLE "MissionResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MissionResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionResource_missionId_idx" ON "MissionResource"("missionId");

-- CreateIndex
CREATE INDEX "MissionResource_userId_idx" ON "MissionResource"("userId");

-- AddForeignKey
ALTER TABLE "MissionResource" ADD CONSTRAINT "MissionResource_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionResource" ADD CONSTRAINT "MissionResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
