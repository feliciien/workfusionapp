/*
  Warnings:

  - You are about to drop the column `stripe_current_period_end` on the `UserSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `UserSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_price_id` on the `UserSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `UserSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paypal_subscription_id]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserSubscription_stripe_customer_id_key";

-- DropIndex
DROP INDEX "UserSubscription_stripe_price_id_key";

-- DropIndex
DROP INDEX "UserSubscription_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "UserSubscription" DROP COLUMN "stripe_current_period_end",
DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_price_id",
DROP COLUMN "stripe_subscription_id",
ADD COLUMN     "paypal_current_period_end" TIMESTAMP(3),
ADD COLUMN     "paypal_plan_id" TEXT,
ADD COLUMN     "paypal_status" TEXT,
ADD COLUMN     "paypal_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_paypal_subscription_id_key" ON "UserSubscription"("paypal_subscription_id");
