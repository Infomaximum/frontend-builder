import TerserWebpackPlugin from "terser-webpack-plugin";
import type { MinifyOptions as TerserOptions } from "terser";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import type webpack from "webpack";

export const minimizerConfig = {
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "modules",
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint: any) => `runtime-${entrypoint.name}`,
    },
    minimizer: [
      new TerserWebpackPlugin<TerserOptions>({
        minify: TerserWebpackPlugin.terserMinify,
        parallel: true,
      }),
      new CssMinimizerPlugin({}),
    ],
  },
} as webpack.Configuration;
