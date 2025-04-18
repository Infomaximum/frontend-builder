import chalk from "chalk";
import fs from "fs";
import path from "path";

export type TGeneratePathsArgs = {
  outputPath: string | undefined;
};

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
  "module.ts",
  "module.tsx",
] as const;

const resolveModule = <T extends (...args: any) => any>(
  resolveFn: T,
  filePath: string,
): ReturnType<T> => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`)),
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

export const generatePaths = (args?: TGeneratePathsArgs) => {
  const assetsPath = resolveApp("assets");
  const staticPath = "_build/static";

  return {
    appPath: resolveApp("."),
    appRelease: args?.outputPath
      ? path.resolve(args.outputPath, "_release")
      : resolveApp("_release"),
    appBuild: resolveApp("_build"),
    assetsPath,
    appVersionConfig: resolveModule(resolveApp, "versions"),

    moduleIndex: generateIndexPath(),
    appPackageJson: resolveApp("package.json"),
    appPackages: resolveApp("packages"),
    appTsConfig: resolveApp("tsconfig.json"),
    appNodeModules: resolveApp("node_modules"),
    publicPath: "/",

    staticPath,
    imagePath: `${staticPath}/img`,
    fontsPath: `${staticPath}/fonts`,
    wasmPath: `${staticPath}/wasm`,
  };
};

export const MODE = {
  DEV: "development",
  PROD: "production",
} as const;

export type TMode = (typeof MODE)[keyof typeof MODE];
export type TPaths = ReturnType<typeof generatePaths>;

export const generateIndexPath = () => {
  const indexSrcPath = resolveModule(resolveApp, "src/index");

  try {
    const mainIndexPath = path.resolve(process.cwd(), require(resolveApp("package.json"))?.main);

    if (mainIndexPath && fs.existsSync(mainIndexPath)) {
      return mainIndexPath;
    }
  } catch (error) {
    console.log(chalk.red("Не найдена секция main в package.json"));
    process.exit(1);
  }

  if (fs.existsSync(indexSrcPath)) {
    return indexSrcPath;
  }

  console.log(chalk.red("Не найден входной файл"));
  process.exit(1);
};
