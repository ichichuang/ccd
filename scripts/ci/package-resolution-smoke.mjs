import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "../..");

const packages = [
  "@ccd/contracts",
  "@ccd/core",
  "@ccd/design-tokens",
  "@ccd/unocss-preset",
];

let failed = false;

for (const pkg of packages) {
  try {
    require.resolve(pkg);
    console.log(`[smoke] ${pkg} resolved OK`);
  } catch (err) {
    console.error(`[smoke] FAIL: cannot resolve ${pkg} from root`);
    failed = true;
  }
}

const distChecks = [
  "packages/contracts/dist/index.d.ts",
  "packages/core/dist/index.d.ts",
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
