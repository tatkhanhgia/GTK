import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

// `eslint-config-next@15.4.x` still ships legacy `.eslintrc`-style configs,
// so we bridge them into flat config via FlatCompat (the pattern Next.js
// itself recommends until a native flat-config export lands).
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // CommonJS files (.cjs) legitimately use require(); the default
  // @typescript-eslint rule flags them by design.
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Project utility scripts run directly in Node and commonly use CommonJS.
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".claude/**",
    ".opencode/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
