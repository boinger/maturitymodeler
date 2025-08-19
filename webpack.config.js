import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './js/radar/setup.js',
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
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        d3: {
          test: /[\\/]js[\\/]d3[\\/]/,
          name: 'd3-vendor',
          chunks: 'all',
          priority: 10
        },
        data: {
          test: /[\\/]js[\\/]data[\\/]/,
          name: 'data',
          chunks: 'all',
          priority: 5
        }
      }
    }
  },
  plugins: [
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
  ]
};