import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

const packages = [
  "@ccd/contracts",
  "@ccd/core",
  "@ccd/design-tokens",
  "@ccd/design-tokens/theme-engine",
  "@ccd/unocss-preset",
  "@ccd/vue-ui",
  "@ccd/vue-charts",
];

let failed = false;

for (const pkg of packages) {
  try {
    const resolved = import.meta.resolve(pkg);
    if (resolved) {
      console.log(`[smoke] ${pkg} resolved OK`);
    } else {
      console.error(`[smoke] FAIL: cannot resolve ${pkg} from root`);
      failed = true;
    }
  } catch (err) {
    console.error(`[smoke] FAIL: cannot resolve ${pkg} from root`);
    failed = true;
  }
}

const distChecks = [
  "packages/contracts/dist/index.d.ts",
  "packages/core/dist/index.d.ts",
  "packages/design-tokens/dist/index.d.ts",
  "packages/design-tokens/dist/theme-engine/index.d.ts",
  "packages/design-tokens/dist/theme-engine/index.js",
  "packages/unocss-preset/dist/index.d.ts",
  "packages/vue-ui/dist/index.d.ts",
  "packages/vue-ui/dist/index.js",
  "packages/vue-charts/dist/index.d.ts",
  "packages/vue-charts/dist/index.js",
];

for (const rel of distChecks) {
  const abs = resolve(root, rel);
  if (existsSync(abs)) {
    console.log(`[smoke] ${rel} exists`);
  } else {
    console.error(`[smoke] FAIL: ${rel} missing after ci:prepare-internal`);
    failed = true;
  }
}

if (failed) {
  console.error("[smoke] Package resolution smoke test FAILED");
  process.exit(1);
}

console.log("[smoke] All package resolution checks passed");
