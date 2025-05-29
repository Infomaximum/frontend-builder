import TerserWebpackPlugin from "terser-webpack-plugin";
import type { MinifyOptions as TerserOptions } from "terser";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import type webpack from "webpack";

export const minimizerWebpackConfig = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        },
      },
    },
    moduleIds: "deterministic",
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin<TerserOptions>({
        minify: TerserWebpackPlugin.terserMinify,
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
      new CssMinimizerPlugin({}),
    ],
  },
} as webpack.Configuration;
