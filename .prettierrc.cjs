/** @type {import('prettier').Config} */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^(react(.*)$)",
    "",
    "^(expo-(.*)$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[./]",
  ],
};

module.exports = config;
