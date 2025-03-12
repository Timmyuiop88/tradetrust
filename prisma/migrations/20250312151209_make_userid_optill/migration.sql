/*
  Warnings:

  - You are about to drop the `_BalanceToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "_BalanceToTransaction" DROP CONSTRAINT "_BalanceToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_BalanceToTransaction" DROP CONSTRAINT "_BalanceToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "balanceId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "_BalanceToTransaction";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
