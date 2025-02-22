import baseConfig from "@romulus/eslint-config";

export default [
  ...baseConfig,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/*"],
  },
];
