import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = (process.env.NODE_ENV || 'production') === 'production';

export default {
  entry: './js/app.js',
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
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',
  optimization: {
    splitChunks: false,  // Disable code splitting for simpler deployment
    runtimeChunk: false,  // Include runtime in main bundle
    minimize: isProd,
    usedExports: true  // Enable tree shaking
  },
  plugins: [
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
  ]
};
