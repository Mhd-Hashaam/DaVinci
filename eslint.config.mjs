import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "tmp/**",
    "Google/**",
  ]),
  {
    rules: {
      // Downgrade to warnings - we'll fix over time
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/ban-ts-comment": ["warn", {
        "ts-ignore": "allow-with-description",
      }],
      // React hooks - keep critical rule as error
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // React 19 experimental strict rules - suppress for now
      // These are new in eslint-plugin-react-hooks v5+ and produce
      // false positives for established patterns (localStorage in
      // useEffect, setting refs in useMemo, performance.now() in useRef, etc.)
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
