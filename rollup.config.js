import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: "json" };

const input = "src/index.ts";

const isProd = process.env.NODE_ENV === "production";

const typescriptPlugin = typescript({
  tsconfig: "./tsconfig.build.json",
});

const plugins = [
  resolve(),
  commonjs(),
  typescriptPlugin,
  ...(isProd ? [terser()] : []),
];

export default [
  {
    input,
    output: {
      file: pkg.browser,
      name: "Tracey",
      format: "umd",
      sourcemap: !isProd,
    },
    plugins,
  },
  {
    input,
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins,
  },
];
