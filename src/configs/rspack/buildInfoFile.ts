import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { BUILD_INFO_FILE_NAME, serializeBuildInfo } from "../buildInfo";
import type { TBuildInfo } from "../../utils";

const PLUGIN_NAME = "BuildInfoFilePlugin";

/** Кладет build-info.json в корень артефакта, рядом с index.html */
class BuildInfoFileRspackPlugin implements RspackPluginInstance {
  constructor(private readonly buildInfo: TBuildInfo) {}

  apply(compiler: Compiler) {
    const { Compilation, sources } = compiler.rspack;

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          compilation.emitAsset(
            BUILD_INFO_FILE_NAME,
            new sources.RawSource(serializeBuildInfo(this.buildInfo)),
          );
        },
      );
    });
  }
}

export const getBuildInfoFileRspackConfig = (buildInfo: TBuildInfo) => ({
  plugins: [new BuildInfoFileRspackPlugin(buildInfo)],
});
