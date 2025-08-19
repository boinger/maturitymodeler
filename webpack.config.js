import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './js/spider/setup-ui.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
      name: 'MaturityModeler'
    },
    globalObject: 'this',
    clean: false  // Don't clean to preserve CSS and other files
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
    splitChunks: false,  // Disable code splitting for simpler deployment
    runtimeChunk: false,  // Include runtime in main bundle
    minimize: true
  },
  plugins: [
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
  ]
};