-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "kbId" TEXT NOT NULL,
    "brandDnaRaw" JSONB NOT NULL,
    "brandDnaEdited" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "audience" TEXT,
    "channelPrefs" JSONB,
    "campaignPack" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_websiteUrl_key" ON "Brand"("websiteUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_kbId_key" ON "Brand"("kbId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
