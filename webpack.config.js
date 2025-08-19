import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './js/radar/setup-webpack.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
      name: 'MaturityModeler'
    },
    globalObject: 'this',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  target: ['web', 'es5'],
  mode: 'production',
  optimization: {
    splitChunks: false  // Disable code splitting for simpler deployment
  },
  plugins: [
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
  ]
};