-- CreateTable
CREATE TABLE "CustomModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "modelId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomModel_userId_idx" ON "CustomModel"("userId");

-- AddForeignKey
ALTER TABLE "CustomModel" ADD CONSTRAINT "CustomModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
