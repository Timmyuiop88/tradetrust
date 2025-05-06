/*
  Warnings:

  - You are about to drop the column `ticketType` on the `EventTicket` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `TicketType` table. All the data in the column will be lost.
  - Added the required column `ticketTypeId` to the `EventTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventTicket" DROP COLUMN "ticketType",
ADD COLUMN     "ticketTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "metadata";

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
