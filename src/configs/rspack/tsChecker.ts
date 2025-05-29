import type { RspackOptions } from "@rspack/core";
import { TsCheckerRspackPlugin } from "ts-checker-rspack-plugin";

export const tsCheckerRspackConfig = {
  plugins: [
    new TsCheckerRspackPlugin({
      async: true,
      typescript: { diagnosticOptions: { semantic: true, syntactic: true } },
    }),
  ],
} satisfies RspackOptions;
