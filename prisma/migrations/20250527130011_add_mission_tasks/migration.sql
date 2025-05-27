-- CreateTable
CREATE TABLE "MissionTask" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "missionId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "MissionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionTask_missionId_idx" ON "MissionTask"("missionId");

-- CreateIndex
CREATE INDEX "MissionTask_creatorId_idx" ON "MissionTask"("creatorId");

-- AddForeignKey
ALTER TABLE "MissionTask" ADD CONSTRAINT "MissionTask_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionTask" ADD CONSTRAINT "MissionTask_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
