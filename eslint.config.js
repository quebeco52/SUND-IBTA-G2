import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["node_modules/**", "dist/**"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error", // catch unused variables
      curly: "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "object-curly-spacing": ["error", "always"],
    },
  },
]);
