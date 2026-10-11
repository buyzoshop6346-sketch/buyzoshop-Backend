-- CreateTable
CREATE TABLE "BlockedCustomer" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "ipAddress" TEXT,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockedCustomer_phone_key" ON "BlockedCustomer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedCustomer_ipAddress_key" ON "BlockedCustomer"("ipAddress");

-- CreateIndex
CREATE INDEX "BlockedCustomer_isActive_idx" ON "BlockedCustomer"("isActive");
