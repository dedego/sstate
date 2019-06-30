module.exports = {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      exports: "named"
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "sstate",
      exports: "named"
    },
    {
      file: "dist/index.m.js",
      format: "esm",
      exports: "named"
    }
  ]
};
