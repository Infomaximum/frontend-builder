//@ts-ignore
import ErrorOverlayPlugin from "error-overlay-webpack-plugin";
import type webpack from "webpack";

export const overlay = {
  plugins: [new ErrorOverlayPlugin()],
  //для активации ErrorOverlayPlugin
  devServer: {},
} as webpack.Configuration;
