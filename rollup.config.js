import fs from "fs";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import builtins from "builtins";
import { terser } from "rollup-plugin-terser";
import ts from "rollup-plugin-typescript2";

const packageJson = JSON.parse(fs.readFileSync("package.json"));
const peerDependencies = Object.keys(packageJson.peerDependencies || {});
const external = builtins().concat(peerDependencies);

function createConfiguration(_options, mode) {
  const suffix = mode === "production" ? ".min" : "";

  const output = [
    {
      format: "cjs",
      dir: "dist",
      entryFileNames: `[name]${suffix}.js`,
      chunkFileNames: `[name]-[hash]${suffix}.js`,
    },
    {
      format: "es",
      dir: "dist",
      entryFileNames: `[name]${suffix}.mjs`,
      chunkFileNames: `[name]-[hash]${suffix}.mjs`,
    },
  ];

  const plugins = [
    replace({
      preventAssignment: true,
      "process.env.npm_package_name": JSON.stringify(
        process.env.npm_package_name
      ),
      "process.env.npm_package_version": JSON.stringify(
        process.env.npm_package_version
      ),
    }),
    resolve(),
    commonjs(),
    json(),
    ts(),
  ];

  if (mode) {
    plugins.push(
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      })
    );
  }

  if (mode === "production") {
    plugins.push(
      terser({
        mangle: { toplevel: true },
      })
    );
  }

  return { output, external, plugins };
}

export default function (options) {
  return [
    createConfiguration(options),
    createConfiguration(options, "production"),
  ];
}
