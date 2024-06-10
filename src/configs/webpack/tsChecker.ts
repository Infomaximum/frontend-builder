import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import type webpack from "webpack";

export const tsChecker = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        memoryLimit: 8192,
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
} as webpack.Configuration;
