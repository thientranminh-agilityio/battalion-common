import { calculatePricesWithMarkupDiscount } from "../pricing";
import { ONE_MILLION_IN_CENTS } from "../../constants";
import Decimal from "decimal.js";

describe("calculatePricesWithMarkupDiscount", () => {
  // Constants from real silver price data
  const SILVER_SPOT = 4944; // $49.44
  const WHOLESALE_MARKUP = 1.119394649;
  const PROMO_DISCOUNT = 20;

  const baseInput = {
    promoMarkupDiscount: 0,
    spotPrice: SILVER_SPOT,
    wholesaleMarkup: WHOLESALE_MARKUP,
    markupByTier: 1.192155301, // T0 markup
    actualMetalWeight: 1,
    maximumPremiumDiscount: 70,
  };

  const formattedTierPriceFor = (spot: number, markup: number) =>
    new Decimal(spot)
      .times(new Decimal(markup))
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

  it("should return original price when no promo discount", () => {
    const expected = formattedTierPriceFor(
      baseInput.spotPrice,
      baseInput.markupByTier
    );

    const result = calculatePricesWithMarkupDiscount(baseInput);

    expect(result.originalPrice).toBe(expected);
    expect(result.calculatedPrice).toBe(expected);
    expect(result.totalDiscount).toBe(0);
    expect(result.totalDiscountPercent).toBe(0);
  });

  it("should calculate discounted price with 20% promo", () => {
    const input = {
      ...baseInput,
      promoMarkupDiscount: PROMO_DISCOUNT,
    };

    const tierPrice = new Decimal(input.spotPrice).times(
      new Decimal(input.markupByTier)
    );
    const nabxPrice = new Decimal(input.spotPrice).times(
      new Decimal(input.wholesaleMarkup)
    );
    const houseMarkup = Decimal.max(tierPrice.minus(nabxPrice), new Decimal(0));
    const discountedHouseMarkup = houseMarkup.times(
      new Decimal(1).minus(new Decimal(PROMO_DISCOUNT).dividedBy(100))
    );
    const expectedCalculated = nabxPrice
      .plus(discountedHouseMarkup)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();
    const expectedOriginal = tierPrice
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

    const result = calculatePricesWithMarkupDiscount(input);

    expect(result.originalPrice).toBe(expectedOriginal);
    expect(result.calculatedPrice).toBe(expectedCalculated);
  });

  it("should return formatted tier price when wholesaleMarkup or metal weight missing", () => {
    const invalids = [
      { ...baseInput, wholesaleMarkup: 0, promoMarkupDiscount: PROMO_DISCOUNT },
      {
        ...baseInput,
        actualMetalWeight: 0,
        promoMarkupDiscount: PROMO_DISCOUNT,
      },
    ];

    invalids.forEach((input) => {
      const expected = formattedTierPriceFor(
        input.spotPrice,
        input.markupByTier
      );
      const result = calculatePricesWithMarkupDiscount(input);
      expect(result.originalPrice).toBe(expected);
      expect(result.calculatedPrice).toBe(expected);
      expect(result.totalDiscount).toBe(0);
      expect(result.totalDiscountPercent).toBe(0);
    });
  });

  it("should handle zero house markup case (tier below wholesale) and return nabxPrice", () => {
    const input = {
      ...baseInput,
      markupByTier: 1.11, // lower than wholesale markup
      promoMarkupDiscount: PROMO_DISCOUNT,
    };

    const expectedNabxPrice = new Decimal(input.spotPrice)
      .times(new Decimal(input.wholesaleMarkup))
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

    const result = calculatePricesWithMarkupDiscount(input);
    expect(result.calculatedPrice).toBe(expectedNabxPrice);
  });

  it("should round prices to integers for fractional spot prices", () => {
    const input = {
      ...baseInput,
      spotPrice: 4943.99,
      promoMarkupDiscount: PROMO_DISCOUNT,
    };

    const result = calculatePricesWithMarkupDiscount(input);

    expect(Number.isInteger(result.calculatedPrice)).toBeTruthy();
    expect(Number.isInteger(result.originalPrice)).toBeTruthy();
  });

  it("should return ONE_MILLION_IN_CENTS when spotPrice or markupByTier is missing", () => {
    const invalids = [
      { ...baseInput, spotPrice: 0 },
      { ...baseInput, markupByTier: 0 },
      { ...baseInput, spotPrice: null as any },
      { ...baseInput, markupByTier: undefined as any },
    ];

    invalids.forEach((input) => {
      const result = calculatePricesWithMarkupDiscount(input);
      expect(result).toEqual({
        originalPrice: ONE_MILLION_IN_CENTS,
        calculatedPrice: ONE_MILLION_IN_CENTS,
        totalDiscount: 0,
        totalDiscountPercent: 0,
      });
    });
  });

  it("should cap discount at maximum premium discount percentage", () => {
    // Use a very high markup tier to create a large premium
    const highMarkupTier = 2.0; // 200% of spot
    const tier0Price = formattedTierPriceFor(
      baseInput.spotPrice,
      highMarkupTier
    );

    const input = {
      ...baseInput,
      markupByTier: highMarkupTier,
      promoMarkupDiscount: 100, // Try to apply 100% discount on house markup
      tier0Price,
      maximumPremiumDiscount: 30, // Cap at 30% of premium
    };

    const result = calculatePricesWithMarkupDiscount(input);

    // Discount should be capped at 30%
    expect(result.totalDiscountPercent).toBe(30);

    // Verify the discount was actually capped by checking the calculated price
    // is higher than it would be without the cap
    const uncappedInput = {
      ...input,
      maximumPremiumDiscount: 100,
    };
    const uncappedResult = calculatePricesWithMarkupDiscount(uncappedInput);
    expect(result.calculatedPrice).toBeGreaterThan(
      uncappedResult.calculatedPrice
    );
  });

  it("should not cap discount if below maximum premium discount", () => {
    const tier0Price = formattedTierPriceFor(
      baseInput.spotPrice,
      baseInput.markupByTier
    );
    const input = {
      ...baseInput,
      promoMarkupDiscount: 30, // 30% discount
      tier0Price,
      maximumPremiumDiscount: 50, // Cap at 50%
    };

    const result = calculatePricesWithMarkupDiscount(input);

    // Should apply the full 30% without capping
    expect(result.totalDiscountPercent).toBeLessThan(50);
    expect(result.totalDiscountPercent).toBeGreaterThan(0);
  });
});
