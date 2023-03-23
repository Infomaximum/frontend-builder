import fs from "fs-extra";
import path from "path";
import { ProgressPlugin } from "webpack";
import { renderFile } from "pug";
import type { TPaths } from "../../paths";

export const getProgressBuildConfig = (PATHS: TPaths) => {
  return {
    plugins: [
      new ProgressPlugin({
        handler: (percentage, message) => {
          if (percentage < 1 && (percentage * 100) % 10 === 0) {
            fs.outputFileSync(
              path.resolve(PATHS.appRelease, "index.html"),
              renderFile(path.resolve(PATHS.assetsPath, "progress.pug"), {
                percentage: percentage * 100,
                message,
              })
            );
          }
        },
      }),
    ],
  };
};
