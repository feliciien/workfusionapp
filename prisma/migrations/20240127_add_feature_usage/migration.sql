-- CreateTable
CREATE TABLE "UserFeatureUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFeatureUsage_userId_idx" ON "UserFeatureUsage"("userId");

-- CreateIndex
CREATE INDEX "UserFeatureUsage_featureType_idx" ON "UserFeatureUsage"("featureType");

-- CreateIndex
CREATE UNIQUE INDEX "UserFeatureUsage_userId_featureType_key" ON "UserFeatureUsage"("userId", "featureType");

-- AddForeignKey
ALTER TABLE "UserFeatureUsage" ADD CONSTRAINT "UserFeatureUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
