/*
  Warnings:

  - A unique constraint covering the columns `[eventLink]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "events_eventLink_key" ON "events"("eventLink");
