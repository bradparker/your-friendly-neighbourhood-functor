module.exports = {
  extends: ["plugin:@typescript-eslint/recommended"],
  env: {
    node: true,
    jest: true
  },
  rules: {
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
};
