-- DropIndex
DROP INDEX "ChatMessage_createdAt_idx";

-- DropIndex
DROP INDEX "ChatMessage_disputeId_idx";

-- DropIndex
DROP INDEX "ChatMessage_isRead_idx";

-- DropIndex
DROP INDEX "ChatMessage_orderId_idx";

-- DropIndex
DROP INDEX "ChatMessage_orderId_recipientId_isRead_idx";

-- DropIndex
DROP INDEX "ChatMessage_recipientId_idx";

-- DropIndex
DROP INDEX "ChatMessage_recipientId_isRead_idx";

-- DropIndex
DROP INDEX "ChatMessage_senderId_idx";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "accountCountry" TEXT,
ADD COLUMN     "credentials" JSONB,
ADD COLUMN     "previewLink" TEXT,
ALTER COLUMN "username" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CryptoPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cryptoAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CryptoPayment_paymentId_key" ON "CryptoPayment"("paymentId");

-- CreateIndex
CREATE INDEX "CryptoPayment_userId_idx" ON "CryptoPayment"("userId");

-- CreateIndex
CREATE INDEX "CryptoPayment_paymentId_idx" ON "CryptoPayment"("paymentId");

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
