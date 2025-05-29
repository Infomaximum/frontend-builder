import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type { TMode, TPaths } from "../../paths";

export const getStylesWebpackConfig = (mode: TMode, PATHS: TPaths) => {
  const isDev = mode === "development";
  const isProd = mode === "production";

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isDev ? require.resolve("style-loader") : MiniCssExtractPlugin.loader,
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
        {
          test: /\.less$/,
          use: [
            isDev ? require.resolve("style-loader") : MiniCssExtractPlugin.loader,
            require.resolve("css-loader"),
            {
              loader: require.resolve("postcss-loader"),
              options: {
                postcssOptions: {
                  plugins: [require.resolve("postcss-preset-env")],
                },
              },
            },
            {
              loader: require.resolve("less-loader"),
              options: {
                sourceMap: isDev,
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      isProd &&
        new MiniCssExtractPlugin({
          filename: `${PATHS.buildCssPath}/[name].[contenthash].css`,
          chunkFilename: `${PATHS.buildCssPath}/[id].[contenthash].css`,
          ignoreOrder: true,
          experimentalUseImportModule: true,
        }),
    ].filter(Boolean),
  };
};
