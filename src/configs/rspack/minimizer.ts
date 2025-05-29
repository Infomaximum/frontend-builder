import rspack, { type RspackOptions } from "@rspack/core";

export const minimizerRspackConfig = {
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
      new rspack.SwcJsMinimizerRspackPlugin({
        extractComments: false,
        minimizerOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
} satisfies RspackOptions;
