//@ts-ignore
import DuplicatePackageCheckerPlugin from "@cerner/duplicate-package-checker-webpack-plugin";

export const duplicateConfig = {
  plugins: [new DuplicatePackageCheckerPlugin({ emitError: false })],
};
