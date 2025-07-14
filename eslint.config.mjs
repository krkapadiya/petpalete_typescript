import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/node_modules" , "**/dist"],
  },
  {
    languageOptions: {
      globals: globals.node, // Use Node.js globals instead of browser
    },
  },
  pluginJs.configs.recommended,
];

// npm install --save-dev eslint prettier eslint-plugin-prettier eslint-config-prettier

// "lint": "eslint .",
// "lint:fix": "eslint . --fix",
// "format": "prettier --write ."
