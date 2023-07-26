/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `message` on the `Message` table. All the data in the column will be lost.
  - The required column `id` was added to the `Message` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "message",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");