import fs from "fs";
import convict from "convict";

type TConfigConvict = {
  // subsystems: string[];
  outputDir: string;
};

export const parseConfig = (configPath: string | undefined) => {
  let conf: TConfigConvict | undefined;

  if (configPath) {
    const configs: TConfigConvict | undefined = require(configPath);
    if (fs.existsSync(configPath)) {
      conf = argsParse.load(require(configPath)).validate({ allowed: "strict" }).getProperties();
    } else {
      throw new Error("Неверные входные параметры");
    }
  }

  return conf;
};

const argsParse = convict({
  //   subsystems: {
  //     doc: "Список модулей для подключения",
  //     format: (subsystems: string[]) => {
  //       subsystems?.forEach?.((subsystem) => {
  //         if (typeof subsystem !== "string") {
  //           throw new Error(`${subsystem} не строка`);
  //         }
  //       });
  //     },
  //     default: [] as string[],
  //   },
  outputDir: {
    doc: "Папка для сборки проекта",
    format: String,
    default: undefined,
  },
});
