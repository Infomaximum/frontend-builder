import CircularDependencyPlugin from "circular-dependency-plugin";
import type webpack from "webpack";
import { WebpackError } from "webpack";

export const circularDependencyDetector = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      // `onStart` is called before the cycle detection starts
      onStart({ compilation }) {
        console.log("start detecting webpack modules cycles");
      },
      // `onDetected` is called for each module that is cyclical
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        compilation.errors.push(new WebpackError(paths.join(" -> ")) as any);
      },
      // `onEnd` is called before the cycle detection ends
      onEnd({ compilation }) {
        console.log("end detecting webpack modules cycles");
      },
    }),
  ],
} as webpack.Configuration;
