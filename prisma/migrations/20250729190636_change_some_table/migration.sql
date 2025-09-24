/*
  Warnings:

  - You are about to drop the column `detailDescription` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `raised` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `Description` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "detailDescription",
DROP COLUMN "raised",
DROP COLUMN "shortDescription",
ADD COLUMN     "Description" TEXT NOT NULL;
