import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export const getBundleAnalyzerConfig = () => ({
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      /* 
      внутри BundleAnalyzerPlugin используется
      path.resolve(this.compiler.outputPath, this.opts.reportFilename || 'report.html') 
      */
      reportFilename: "../webpack-report.html",
    }) as any,
  ],
});
