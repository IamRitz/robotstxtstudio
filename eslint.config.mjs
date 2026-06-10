import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "next-env.d.ts",
      "Screens/**",
    ],
  },
  {
    rules: {
      // Allow intentional `_`-prefixed unused bindings (e.g. destructure-to-omit).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Natural prose (apostrophes/quotes) in JSX content pages.
      "react/no-unescaped-entities": "off",
      // Enforce feature boundaries: import features via their barrel only.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message:
                "Import a feature via its barrel (@/features/<name>), not deep internal paths.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
