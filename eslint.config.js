const typescript = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    ignores: ["src/main/scripts/test.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "no-unused-expressions": "off",
      "no-prototype-builtins": "error",
      "@typescript-eslint/no-duplicate-enum-values": "warn",
      "@typescript-eslint/no-var-requires": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      "no-dupe-class-members": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      indent: ["off"],
      semi: ["error", "always"],
      "new-cap": ["off"],
      "comma-dangle": ["warn", "always-multiline"],
    },
  },
];
