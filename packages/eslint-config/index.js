module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb-typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "func-names": [
      "warn",
      "always",
      {
        generators: "never",
      },
    ],
    "no-console": "off",
    "no-else-return": "off",
    "no-restricted-syntax": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "jsx-a11y/anchor-is-valid": "off", // Anchor tags inside Link components don't require href.
    "react/jsx-curly-newline": "off",
    "react/jsx-filename-extension": [
      2,
      {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    ],
    "react/jsx-one-expression-per-line": 0,
    "react/jsx-props-no-spreading": "off",
    "react/jsx-wrap-multilines": [
      "error",
      {
        prop: "ignore",
      },
    ],
    "react/prop-types": 0,
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/quotes": [2, "double"],
  },
};
