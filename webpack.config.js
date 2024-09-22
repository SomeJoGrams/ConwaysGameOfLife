const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  mode: "production", 
  entry: {
    index: path.resolve(__dirname, 'src', 'main', 'index.ts'),
    print: path.resolve(__dirname, 'src', 'main', 'print.ts'),
    wallpaper_engine: path.resolve(__dirname, 'src', 'main', 'wallpaper_engine.ts'),
    canvas_worker: path.resolve(__dirname, 'src', 'workers', 'canvas_worker.ts'),
  },
  output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Conways Game of Life',
      template: path.resolve("resources", "html_templates", "index.hbs")
      // this could be used if the whole page was the template, however i generate the template inside the code template: './html_templates/game_field.hbs' // see alternatives here: https://github.com/jantimon/html-webpack-plugin/blob/main/docs/template-option.md
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
      extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
    ],
  },
  devtool: 'inline-source-map',
};