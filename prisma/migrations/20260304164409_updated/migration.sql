/*
  Warnings:

  - You are about to drop the column `brand` on the `Item` table. All the data in the column will be lost.
  - Added the required column `brand` to the `DeliveryDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeliveryDetails" ADD COLUMN     "brand" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "brand";
