/*
  Warnings:

  - You are about to drop the column `likeCount` on the `DonationPost` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "DonationPost" DROP COLUMN "likeCount";

-- CreateTable
CREATE TABLE "DonationReaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "donationPostId" INTEGER NOT NULL,
    "type" "ReactionType" NOT NULL,

    CONSTRAINT "DonationReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationReaction_userId_donationPostId_key" ON "DonationReaction"("userId", "donationPostId");

-- AddForeignKey
ALTER TABLE "DonationReaction" ADD CONSTRAINT "DonationReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReaction" ADD CONSTRAINT "DonationReaction_donationPostId_fkey" FOREIGN KEY ("donationPostId") REFERENCES "DonationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
