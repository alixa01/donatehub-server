/*
  Warnings:

  - You are about to drop the column `txHash` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "txHash",
ADD COLUMN     "contractAddress" TEXT;
