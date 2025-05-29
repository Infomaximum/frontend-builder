import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
import type { TPaths } from "../../paths";
import path from "path";

export const getRsDoctorRspackConfig = (PATHS: TPaths) => ({
  plugins: [
    new RsdoctorRspackPlugin({
      disableClientServer: true,
      mode: "brief",
      brief: {
        writeDataJson: false,
      },
      supports: { generateTileGraph: true },
      output: {
        reportDir: path.join(PATHS.appPath, ".rsdoctor"),
      },
    }),
  ],
});
