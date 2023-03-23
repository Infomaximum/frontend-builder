import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export const getBundleAnalyzerConfig = () => ({
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }) as any,
  ],
});
