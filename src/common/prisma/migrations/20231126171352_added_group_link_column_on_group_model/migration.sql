/*
  Warnings:

  - A unique constraint covering the columns `[groupLink]` on the table `groups` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "groupLink" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "groups_groupLink_key" ON "groups"("groupLink");
