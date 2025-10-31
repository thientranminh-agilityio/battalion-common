# TypeScript Usage Guide

## For TypeScript Projects

If you're having issues importing from `@thientranminh-agilityio/battalion-common` in TypeScript, update your `tsconfig.json`:

### Recommended TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    // or alternatively:
    // "module": "Node16",
    // "moduleResolution": "node16",
    // or for bundlers:
    // "module": "ESNext",
    // "moduleResolution": "bundler",

    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### Working Import Examples

```typescript
// ✅ Main imports
import {
  calculatePricesWithMarkupDiscount,
  ONE_MILLION_IN_CENTS,
} from "@thientranminh-agilityio/battalion-common";
import type {
  CalculatePricesWithMarkupDiscountInput,
  CalculatedPricesWithMarkupDiscount,
} from "@thientranminh-agilityio/battalion-common";

// ✅ Folder-level imports
import { calculatePricesWithMarkupDiscount } from "@thientranminh-agilityio/battalion-common/utils";
import { ONE_MILLION_IN_CENTS } from "@thientranminh-agilityio/battalion-common/constants";

// ✅ File-level imports
import { calculatePricesWithMarkupDiscount } from "@thientranminh-agilityio/battalion-common/utils/pricing";
import { ONE_MILLION_IN_CENTS } from "@thientranminh-agilityio/battalion-common/constants/pricing";
```

### Usage with Types

```typescript
import { calculatePricesWithMarkupDiscount } from "@thientranminh-agilityio/battalion-common";
import type { CalculatePricesWithMarkupDiscountInput } from "@thientranminh-agilityio/battalion-common";

const input: CalculatePricesWithMarkupDiscountInput = {
  promoMarkupDiscount: 10,
  spotPrice: 2000,
  wholesaleMarkup: 0.95,
  markupByTier: 1.1,
  actualMetalWeight: 1.0,
  maximumPremiumDiscount: 50,
};

const result = calculatePricesWithMarkupDiscount(input);
console.log(`Price: $${result.calculatedPrice / 100}`);
```

### Troubleshooting

If you get module resolution errors:

1. **Update moduleResolution**: Use `"moduleResolution": "node16"`, `"nodenext"`, or `"bundler"`
2. **Check TypeScript version**: Ensure you're using TypeScript 4.7+
3. **Verify exports**: The package uses modern `exports` field which requires newer resolution strategies

### Old TypeScript Projects

If you must use older TypeScript/Node resolution (`"moduleResolution": "node"`), you can import directly from dist:

```typescript
// Fallback for older TypeScript projects
import { calculatePricesWithMarkupDiscount } from "@thientranminh-agilityio/battalion-common/dist/utils/pricing";
import { ONE_MILLION_IN_CENTS } from "@thientranminh-agilityio/battalion-common/dist/constants/pricing";
```
