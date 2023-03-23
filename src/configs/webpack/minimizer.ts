import CompressionPlugin from "compression-webpack-plugin";
import TerserWebpackPlugin from "terser-webpack-plugin";
import type { MinifyOptions as TerserOptions } from "terser";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import type webpack from "webpack";

export const minimizerConfig = {
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
      maxSize: 1024 * 244,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "node_modules",
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
  plugins: [
    // отключил, так как не используется
    // new CompressionPlugin({
    //   filename: "[path][base].gz",
    //   algorithm: "gzip",
    //   test: /\.(js|css|html|svg)$/,
    //   compressionOptions: { level: 9 },
    //   threshold: 10240,
    //   minRatio: 0.8,
    //   deleteOriginalAssets: false,
    // }),
  ],
} as webpack.Configuration;
