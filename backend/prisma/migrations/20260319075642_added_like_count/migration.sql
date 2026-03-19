/*
  Warnings:

  - Added the required column `likeCount` to the `DonationPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DonationPost" ADD COLUMN     "likeCount" INTEGER NOT NULL;
