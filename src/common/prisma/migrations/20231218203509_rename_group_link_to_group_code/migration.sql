/*
  Warnings:

  - You are about to drop the column `groupLink` on the `groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupCode]` on the table `groups` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "groups_groupLink_idx";

-- DropIndex
DROP INDEX "groups_groupLink_key";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "groupLink",
ADD COLUMN     "groupCode" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "groups_groupCode_key" ON "groups"("groupCode");

-- CreateIndex
CREATE INDEX "groups_groupCode_idx" ON "groups"("groupCode");
