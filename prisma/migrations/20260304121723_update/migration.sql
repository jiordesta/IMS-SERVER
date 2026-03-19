/*
  Warnings:

  - You are about to drop the column `price` on the `ProductDetails` table. All the data in the column will be lost.
  - You are about to drop the column `stocks` on the `ProductDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductDetails" DROP COLUMN "price",
DROP COLUMN "stocks";

-- CreateTable
CREATE TABLE "PriceList" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "priceListId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_productId_key" ON "PriceList"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_priceListId_key" ON "Price"("priceListId");

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
