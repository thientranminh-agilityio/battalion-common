/**
 * Input parameters for calculating prices with markup discount
 */
export type CalculatePricesWithMarkupDiscountInput = {
  /** Promotional markup discount percentage (0-100) */
  promoMarkupDiscount: number;
  /** Current spot price of the metal in cents */
  spotPrice: number;
  /** Wholesale markup multiplier (e.g., 0.95 for 95% of spot) */
  wholesaleMarkup: number;
  /** Tier-specific markup multiplier (e.g., 1.1 for 110% of spot) */
  markupByTier: number;
  /** Actual weight of metal in the product (in ounces) */
  actualMetalWeight: number;
  /** Optional: Price of tier 0 for premium discount calculation */
  tier0Price?: number;
  /** Maximum allowed premium discount percentage (cap) */
  maximumPremiumDiscount: number;
};

/**
 * Result of price calculation with markup discount
 */
export type CalculatedPricesWithMarkupDiscount = {
  /** Original price before any discounts (in cents) */
  originalPrice: number;
  /** Final calculated price after discounts (in cents) */
  calculatedPrice: number;
  /** Total discount amount (in cents) */
  totalDiscount: number;
  /** Total discount as percentage of tier0 premium */
  totalDiscountPercent?: number;
};
