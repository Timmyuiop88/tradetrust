/*
  Warnings:

  - The `credentials` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "credentials",
ADD COLUMN     "credentials" JSONB;
