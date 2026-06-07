import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const packagesRoot = resolve(root, "packages");

let failed = false;

function fail(message) {
  console.error(`[smoke] FAIL: ${message}`);
  failed = true;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function normalizeTarget(target) {
  return target.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isSourceTarget(target) {
  const normalized = normalizeTarget(target);
  return normalized === "src" || normalized.startsWith("src/");
}

function isSourceExportKey(key) {
  return key === "./src" || key.startsWith("./src/");
}

function isRelativeTarget(target) {
  return target.startsWith("./");
}

function isCheckedArtifactTarget(target) {
  const normalized = normalizeTarget(target);
  return (
    /\.(?:mjs|cjs|js|css)$/u.test(normalized) ||
    normalized.endsWith(".d.ts") ||
    normalized.endsWith(".d.mts") ||
    normalized.endsWith(".d.cts")
  );
}

function isDeclarationTarget(target) {
  const normalized = normalizeTarget(target);
  return (
    normalized.endsWith(".d.ts") ||
    normalized.endsWith(".d.mts") ||
    normalized.endsWith(".d.cts")
  );
}

function packageDirs() {
  return readdirSync(packagesRoot)
    .map(name => resolve(packagesRoot, name))
    .filter(dir => statSync(dir).isDirectory() && existsSync(resolve(dir, "package.json")))
    .sort((a, b) => a.localeCompare(b));
}

function hasTypeScriptSurface(packageDir) {
  return existsSync(resolve(packageDir, "tsconfig.json")) || existsSync(resolve(packageDir, "tsconfig.build.json"));
}

function targetEntries(value, baseKey) {
  if (typeof value === "string") return [{ key: baseKey, target: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => targetEntries(item, `${baseKey}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => targetEntries(item, `${baseKey}.${key}`));
  }
  return [];
}

function rootDeclarationTarget(rootExport) {
  return targetEntries(rootExport, 'exports["."]').find(entry => isDeclarationTarget(entry.target));
}

function exportTargetEntries(exportsField) {
  if (!exportsField) return [];
  if (typeof exportsField === "string" || Array.isArray(exportsField)) {
    return targetEntries(exportsField, 'exports["."]');
  }

  const keys = Object.keys(exportsField);
  const hasSubpathKeys = keys.some(key => key.startsWith("."));
  if (!hasSubpathKeys) return targetEntries(exportsField, 'exports["."]');

  return keys.flatMap(key => targetEntries(exportsField[key], `exports["${key}"]`));
}

function publicExportSubpaths(exportsField) {
  if (!exportsField) return [];
  if (typeof exportsField === "string" || Array.isArray(exportsField)) return ["."];

  const keys = Object.keys(exportsField);
  if (!keys.some(key => key.startsWith("."))) return ["."];

  return keys.sort((a, b) => a.localeCompare(b));
}

function validateTarget(packageName, packageDir, key, target) {
  if (!isRelativeTarget(target)) return;

  if (isSourceTarget(target)) {
    fail(`${packageName} ${key} points to forbidden source target ${target}`);
    return;
  }

  if (!isCheckedArtifactTarget(target)) return;

  const artifact = resolve(packageDir, target);
  if (!existsSync(artifact)) {
    fail(`${packageName} ${key} missing exported artifact ${target}`);
  }
}

function validateManifest(packageDir) {
  const manifestPath = resolve(packageDir, "package.json");
  const manifest = readJson(manifestPath);
  const packageName = manifest.name ?? manifestPath;
  const tsBased = hasTypeScriptSurface(packageDir);
  const manifestTargets = [];

  for (const key of ["main", "module", "types"]) {
    if (typeof manifest[key] === "string") {
      manifestTargets.push({ key, target: manifest[key] });
    }
  }

  if (manifest.exports) {
    if (typeof manifest.exports === "object" && !Array.isArray(manifest.exports)) {
      for (const key of Object.keys(manifest.exports)) {
        if (isSourceExportKey(key)) {
          fail(`${packageName} exports["${key}"] exposes forbidden source subpath ${key}`);
        }
        if (key.includes("*")) {
          fail(`${packageName} exports["${key}"] uses a wildcard export that cannot be artifact-checked deterministically`);
        }
      }
    }

    manifestTargets.push(...exportTargetEntries(manifest.exports));

    const rootExport =
      typeof manifest.exports === "object" && !Array.isArray(manifest.exports)
        ? manifest.exports["."]
        : manifest.exports;
    if (tsBased && !rootDeclarationTarget(rootExport)) {
      fail(`${packageName} exports["."] missing declaration target for TypeScript package`);
    }
  }

  for (const { key, target } of manifestTargets) {
    validateTarget(packageName, packageDir, key, target);
  }

  return { manifest, subpaths: publicExportSubpaths(manifest.exports) };
}

const packageChecks = packageDirs().map(packageDir => ({
  packageDir,
  ...validateManifest(packageDir),
}));

for (const { manifest, subpaths } of packageChecks) {
  for (const subpath of subpaths) {
    if (subpath.includes("*")) continue;

    const specifier = subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
    try {
      const resolved = import.meta.resolve(specifier);
      if (resolved) {
        console.log(`[smoke] ${specifier} resolved OK`);
      } else {
        fail(`cannot resolve ${specifier} from root`);
      }
    } catch {
      fail(`cannot resolve ${specifier} from root`);
    }
  }
}

if (failed) {
  console.error("[smoke] Package resolution smoke test FAILED");
  process.exit(1);
}

console.log("[smoke] All package resolution checks passed");
