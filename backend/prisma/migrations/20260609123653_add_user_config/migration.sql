-- CreateTable
CREATE TABLE "UserConfig" (
    "id" TEXT NOT NULL,
    "profileName" TEXT NOT NULL DEFAULT 'Operador',
    "archetype" TEXT NOT NULL DEFAULT 'Estrategista',
    "intensity" TEXT NOT NULL DEFAULT 'high',
    "focusPhrase" TEXT NOT NULL DEFAULT 'Execute com precisão.',
    "focusDuration" INTEGER NOT NULL DEFAULT 25,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "mood" TEXT,
    "moodHistory" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_userId_key" ON "UserConfig"("userId");

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
