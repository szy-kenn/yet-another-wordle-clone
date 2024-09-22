const FileManagerPlugin = require("filemanager-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/ts/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },

  devtool: false,

  resolve: {
    extensions: [".ts", ".js"],
  },

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 4000,
  },

  plugins: [
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: path.resolve(__dirname, "dist", "**", "*.js"),
              destination: path.resolve(__dirname, "public", "js"),
            },
          ],
        },
      },
    }),
  ],
};
