/*
  Warnings:

  - You are about to drop the column `evidence` on the `Dispute` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `reason` on the `Dispute` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'DISPUTED';

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_orderId_fkey";

-- DropIndex
DROP INDEX "Dispute_assignedModId_idx";

-- DropIndex
DROP INDEX "Dispute_initiatorId_idx";

-- DropIndex
DROP INDEX "Dispute_orderId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "disputeId" TEXT,
ADD COLUMN     "isModOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipientId" TEXT NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Dispute" DROP COLUMN "evidence",
DROP COLUMN "reason",
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "listingId" TEXT,
ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
