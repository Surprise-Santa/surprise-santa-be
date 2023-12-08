/*
  Warnings:

  - You are about to drop the column `beneficiary` on the `event_pairings` table. All the data in the column will be lost.
  - You are about to drop the column `donor` on the `event_pairings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,beneficiaryId]` on the table `event_pairings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,donorId]` on the table `event_pairings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `beneficiaryId` to the `event_pairings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donorId` to the `event_pairings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_pairings" DROP COLUMN "beneficiary",
DROP COLUMN "donor",
ADD COLUMN     "beneficiaryId" UUID NOT NULL,
ADD COLUMN     "donorId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_pairings_eventId_beneficiaryId_key" ON "event_pairings"("eventId", "beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "event_pairings_eventId_donorId_key" ON "event_pairings"("eventId", "donorId");

-- AddForeignKey
ALTER TABLE "event_pairings" ADD CONSTRAINT "event_pairings_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_pairings" ADD CONSTRAINT "event_pairings_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
