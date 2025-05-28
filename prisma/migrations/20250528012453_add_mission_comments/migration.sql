-- CreateTable
CREATE TABLE "MissionComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MissionComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionComment_missionId_idx" ON "MissionComment"("missionId");

-- CreateIndex
CREATE INDEX "MissionComment_userId_idx" ON "MissionComment"("userId");

-- AddForeignKey
ALTER TABLE "MissionComment" ADD CONSTRAINT "MissionComment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionComment" ADD CONSTRAINT "MissionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
