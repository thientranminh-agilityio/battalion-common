import Decimal from "decimal.js";
import {
  CalculatedPricesWithMarkupDiscount,
  CalculatePricesWithMarkupDiscountInput,
} from "../types";
import { ONE_MILLION_IN_CENTS } from "../constants";

/**
 * Calculate prices with promotional markup discount applied.
 *
 * This function calculates product pricing based on:
 * 1. Spot metal price
 * 2. Tier-specific markup
 * 3. Wholesale markup
 * 4. Promotional discount on house markup
 * 5. Maximum premium discount cap
 *
 * The discount is applied only to the "house markup" (the difference between
 * the tier price and wholesale price), and is capped at a maximum percentage
 * of the tier0 premium to prevent excessive discounts.
 *
 * @param input - Pricing calculation parameters
 * @returns Calculated prices with discount information
 *
 * @example
 * ```typescript
 * const result = calculatePricesWithMarkupDiscount({
 *   spotPrice: 2000,
 *   markupByTier: 1.1,
 *   promoMarkupDiscount: 20,
 *   wholesaleMarkup: 0.95,
 *   actualMetalWeight: 1.0,
 *   maximumPremiumDiscount: 50
 * });
 * // Returns: { originalPrice: 2200, calculatedPrice: 2160, ... }
 * ```
 */
export function calculatePricesWithMarkupDiscount(
  input: CalculatePricesWithMarkupDiscountInput
): CalculatedPricesWithMarkupDiscount {
  const {
    promoMarkupDiscount,
    spotPrice,
    wholesaleMarkup,
    markupByTier,
    actualMetalWeight,
    tier0Price,
    maximumPremiumDiscount,
  } = input;

  // Validate required inputs
  if (!spotPrice || !markupByTier) {
    return {
      originalPrice: ONE_MILLION_IN_CENTS,
      calculatedPrice: ONE_MILLION_IN_CENTS,
      totalDiscount: 0,
      totalDiscountPercent: 0,
    };
  }

  // Calculate tier price
  const tierPrice = new Decimal(spotPrice).times(new Decimal(markupByTier));
  const formattedTierPrice = tierPrice
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();

  // If no promo discount, return tier price
  if (!promoMarkupDiscount || !wholesaleMarkup || !actualMetalWeight) {
    return {
      originalPrice: formattedTierPrice,
      calculatedPrice: formattedTierPrice,
      totalDiscount: 0,
      totalDiscountPercent: 0,
    };
  }

  // Calculate base prices
  const nabxPrice = new Decimal(spotPrice).times(new Decimal(wholesaleMarkup));
  const meltValue = new Decimal(spotPrice).times(
    new Decimal(actualMetalWeight)
  );

  // Calculate tier0's premium if this isn't tier0
  const tier0PriceDecimal = tier0Price ? new Decimal(tier0Price) : tierPrice;
  const tier0Premium = tier0PriceDecimal.minus(meltValue);

  // Calculate house markup (incremental markup above wholesale)
  // Clamp: if a tier ends up below wholesale, don't make discount increase price
  let houseMarkup = tierPrice.minus(nabxPrice);
  houseMarkup = houseMarkup.lessThan(0) ? new Decimal(0) : houseMarkup;

  // Apply discount to house markup only
  const markupDiscountRate = new Decimal(promoMarkupDiscount).dividedBy(100);
  const discountedHouseMarkup = houseMarkup.times(
    new Decimal(1).minus(markupDiscountRate)
  );

  // Calculate discounted final price
  let discountedFinalPrice = nabxPrice.plus(discountedHouseMarkup);

  // Calculate total discount using tier0 price for non-tier0
  let totalDiscount = tier0PriceDecimal.minus(discountedFinalPrice);

  // Always use tier0's premium for percentage calculation
  let totalDiscountPercent = tier0Premium.isZero()
    ? new Decimal(0)
    : totalDiscount.dividedBy(tier0Premium).times(new Decimal(100));

  // Validate against maximum premium discount if specified
  if (totalDiscountPercent.greaterThan(maximumPremiumDiscount)) {
    // Recalculate with capped discount percentage
    const cappedDiscountAmount = tier0Premium
      .times(new Decimal(maximumPremiumDiscount))
      .dividedBy(100);
    discountedFinalPrice = tier0PriceDecimal.minus(cappedDiscountAmount);
    totalDiscount = cappedDiscountAmount;
    totalDiscountPercent = new Decimal(maximumPremiumDiscount);
  }

  return {
    originalPrice: formattedTierPrice,
    calculatedPrice: discountedFinalPrice
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber(),
    totalDiscount: totalDiscount
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber(),
    totalDiscountPercent: totalDiscountPercent
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber(),
  };
}
