const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',

  entry: {
    main: path.resolve(__dirname, 'src/main.ts'),
    ui: path.resolve(__dirname, 'src/ui.tsx'),
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
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

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/ui.html'),
      filename: 'ui.html',
      chunks: ['ui'],
      inject: 'head',
    }),
  ],

  optimization: {
    minimize: true,
  },

  stats: 'errors-warnings',
};
