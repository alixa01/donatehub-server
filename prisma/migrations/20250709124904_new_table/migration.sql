/*
  Warnings:

  - Added the required column `txHash` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "txHash" TEXT NOT NULL;
