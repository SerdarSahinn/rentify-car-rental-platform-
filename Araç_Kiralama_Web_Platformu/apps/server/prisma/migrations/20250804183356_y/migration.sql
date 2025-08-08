/*
  Warnings:

  - A unique constraint covering the columns `[userId,vehicleId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand,model,year]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_vehicleId_key" ON "reviews"("userId", "vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_brand_model_year_key" ON "vehicles"("brand", "model", "year");
