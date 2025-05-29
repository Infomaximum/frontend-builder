import type { TMode, TPaths } from "../../paths";
import rspack, { type RspackOptions } from "@rspack/core";

export const getStylesRspackConfig = (mode: TMode, PATHS: TPaths) => {
  const isDev = mode === "development";
  const isProd = mode === "production";

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          type: "javascript/auto",
          use: [
            isDev ? require.resolve("style-loader") : rspack.CssExtractRspackPlugin.loader,
            require.resolve("css-loader"),
            {
              loader: require.resolve("postcss-loader"),
              options: {
                postcssOptions: {
                  plugins: [require.resolve("postcss-preset-env")],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      isProd &&
        new rspack.CssExtractRspackPlugin({
          filename: `${PATHS.buildCssPath}/[name].[contenthash].css`,
          chunkFilename: `${PATHS.buildCssPath}/[id].[contenthash].css`,
          ignoreOrder: true,
        }),
    ],
  } satisfies RspackOptions;
};
