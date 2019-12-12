import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

module.exports = {
  input: "src/index.js",
  output: [
    {
      file: pkg["main"],
      format: "umd",
      sourcemap: true,
      exports: "named",
      name: "Sstate"
    },
    {
      file: pkg["module"],
      format: "esm",
      sourcemap: true,
      exports: "named",
      name: "Sstate"
    }
  ],
  plugins: [terser()]
};
