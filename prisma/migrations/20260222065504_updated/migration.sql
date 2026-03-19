/*
  Warnings:

  - Added the required column `commonName` to the `ProductDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `ProductDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductDetails" ADD COLUMN     "commonName" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL;
