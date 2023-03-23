import packageJson from "../../../package.json";

export const getBabelConfig = (isDev: boolean, isHMR?: boolean) => {
  return {
    loader: require.resolve("babel-loader"),
    options: {
      cacheDirectory: true,
      babelrc: false,
      configFile: false,
      plugins: [
        isHMR && require.resolve("react-refresh/babel"),
        require.resolve("@babel/plugin-syntax-dynamic-import"),
        require.resolve("@babel/plugin-transform-runtime"),
        require.resolve("@babel/plugin-transform-regenerator"),
        require.resolve("@emotion/babel-plugin"),
      ].filter(Boolean),
      presets: [
        [
          require.resolve("@babel/preset-env"),
          {
            corejs: packageJson.dependencies["core-js"],
            useBuiltIns: "entry",
          },
        ],
        [
          require.resolve("@babel/preset-react"),
          {
            runtime: "automatic",
            importSource: "@emotion/react",
          },
        ],
      ],
    },
  };
};
