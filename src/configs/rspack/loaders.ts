import type { TMode, TPaths } from "../../paths";

export const getRspackLoaders = (mode: TMode, PATHS: TPaths) => {
  return {
    module: {
      rules: [
        {
          test: /\.svg$/i,
          oneOf: [
            {
              type: "asset",
              resourceQuery: /url/, // *.svg?url
              parser: {
                dataUrlCondition: {
                  maxSize: 64 * 1024, // 64kb
                },
              },
              generator: {
                filename: `${PATHS.imagePath}/[hash][ext][query]`,
              },
            },
            {
              type: "asset/source",
              resourceQuery: /src/, // *.svg?src
            },
            {
              issuer: /\.[jt]sx?$/,
              loader: "@svgr/webpack",
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: "removeViewBox",
                      active: false,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|cur)$/i,
          type: "asset/resource",
          generator: {
            filename: `${PATHS.imagePath}/[name][ext]`,
          },
        },
        {
          test: /\.pug$/,
          use: ["pug-loader"],
        },
        {
          test: /\.(woff(2)?|ttf|eot)$/i,
          type: "asset/resource",
          generator: {
            filename: `${PATHS.fontsPath}/[name][ext]`,
          },
        },
        {
          test: /\.ico$/i,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
      ],
    },
  };
};
