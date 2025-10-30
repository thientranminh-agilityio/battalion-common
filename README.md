# @battalion/common

Shared utilities and types for Battalion Metals Medusa project.

This package contains shared logic used across both the Medusa backend and the storefront to ensure consistency in pricing calculations, particularly for metal product pricing with promotional discounts.

## Installation

```bash
npm install @battalion/common
```

## Quick Start

```typescript
import {
  calculatePricesWithMarkupDiscount,
  ONE_MILLION_IN_CENTS,
} from "@battalion/common";
import type {
  CalculatePricesWithMarkupDiscountInput,
  CalculatedPricesWithMarkupDiscount,
} from "@battalion/common";

// Calculate pricing for a metal product
const result = calculatePricesWithMarkupDiscount({
  spotPrice: 200000, // $2000.00 in cents
  markupByTier: 1.1, // 110% of spot price
  promoMarkupDiscount: 20, // 20% discount on house markup
  wholesaleMarkup: 0.95, // 95% of spot price
  actualMetalWeight: 1.0, // 1 ounce
  maximumPremiumDiscount: 50, // Max 50% discount cap
  tier0Price: 210000, // Optional tier 0 reference price
});

console.log(`Original Price: $${result.originalPrice / 100}`);
console.log(`Final Price: $${result.calculatedPrice / 100}`);
console.log(`Total Discount: $${result.totalDiscount / 100}`);
```

## Package Structure

```
src/
├── constants/     # Shared constants (pricing fallbacks, etc.)
├── types/         # TypeScript type definitions
├── utils/         # Business logic functions
└── index.ts       # Main exports
```

## API Reference

### Functions

#### `calculatePricesWithMarkupDiscount(input: CalculatePricesWithMarkupDiscountInput): CalculatedPricesWithMarkupDiscount`

Calculate product pricing with promotional markup discount applied.

**Algorithm:**

1. Calculate base tier price from spot price and tier markup
2. Calculate wholesale price from spot price and wholesale markup
3. Apply promotional discount only to the "house markup" (tier - wholesale)
4. Apply maximum premium discount cap based on tier0 reference price
5. Return original price, final price, and discount details

**Parameters:**

- `promoMarkupDiscount` - Promotional discount percentage (0-100)
- `spotPrice` - Current metal spot price in cents
- `wholesaleMarkup` - Wholesale multiplier (e.g., 0.95 for 95% of spot)
- `markupByTier` - Tier-specific multiplier (e.g., 1.1 for 110% of spot)
- `actualMetalWeight` - Metal weight in ounces
- `tier0Price` - Optional tier 0 price for premium discount calculation
- `maximumPremiumDiscount` - Maximum allowed premium discount percentage

**Returns:**

- `originalPrice` - Price before any discounts (in cents)
- `calculatedPrice` - Final price after discounts (in cents)
- `totalDiscount` - Total discount amount (in cents)
- `totalDiscountPercent` - Discount as percentage of tier0 premium (optional)

### Constants

#### `ONE_MILLION_IN_CENTS`

Fallback price constant: `100,000,000` cents ($1,000,000.00)

Used when pricing calculations fail or inputs are invalid. The high value ensures that pricing errors are immediately obvious in the UI/system.

### Types

#### `CalculatePricesWithMarkupDiscountInput`

Input parameters for price calculation with detailed JSDoc annotations.

#### `CalculatedPricesWithMarkupDiscount`

Result object containing original price, calculated price, discount amounts and percentages.

## Usage Examples

### Basic Pricing Calculation

```typescript
import { calculatePricesWithMarkupDiscount } from "@battalion/common";

// Simple pricing for a 1oz gold coin
const goldCoinPrice = calculatePricesWithMarkupDiscount({
  spotPrice: 200000, // $2000 spot gold
  markupByTier: 1.05, // 5% markup for tier
  promoMarkupDiscount: 15, // 15% promotional discount
  wholesaleMarkup: 0.98, // 2% below spot for wholesale
  actualMetalWeight: 1.0, // 1 ounce
  maximumPremiumDiscount: 30, // Cap discount at 30%
});
```

### With Tier 0 Reference Pricing

```typescript
// More complex pricing with tier 0 reference
const silverBarPrice = calculatePricesWithMarkupDiscount({
  spotPrice: 2500, // $25 spot silver
  markupByTier: 1.15, // 15% markup for this tier
  promoMarkupDiscount: 25, // 25% promotional discount
  wholesaleMarkup: 0.95, // 5% below spot for wholesale
  actualMetalWeight: 10.0, // 10 ounce bar
  tier0Price: 28750, // $287.50 tier 0 price
  maximumPremiumDiscount: 50, // Cap discount at 50% of tier0 premium
});
```

### Error Handling

```typescript
import { ONE_MILLION_IN_CENTS } from "@battalion/common";

// Use fallback constant for error states
const safePrice =
  result.calculatedPrice === ONE_MILLION_IN_CENTS
    ? "Price calculation failed"
    : `$${result.calculatedPrice / 100}`;
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes during development
npm run dev

# Clean build artifacts
npm run clean

# Prepare for publishing (builds automatically)
npm run prepublishOnly
```

## Publishing

### Local Development

```bash
# Link for local testing
npm link

# In consuming project
npm link @battalion/common
```

### Package Registry

```bash
# Publish to npm (or private registry)
npm publish
```

### Git Installation

```bash
# Install from git repository
npm install git+https://github.com/your-org/battalion-common.git
```

## Dependencies

- **`decimal.js`** - High precision decimal arithmetic for accurate financial calculations
- **TypeScript** - Development dependency for type checking and compilation

## License

MIT
