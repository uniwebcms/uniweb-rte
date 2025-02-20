// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import packageJson from './package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
    return {
        mode: argv.mode || 'production',
        entry: path.resolve(__dirname, 'src', 'main.js'),
        output: {
            // filename: '[name].[contenthash].js',
            filename: '[name].js',
            chunkFilename: '[name].[contenthash].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            publicPath: 'auto',
            library: {
                type: 'module'
            }
        },
        experiments: {
            outputModule: true // Required for library.type: 'module'
        },
        externals: {
            react: 'react',
            'react-dom': 'react-dom',
            'react-router-dom': 'react-router-dom'
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: ['@babel/plugin-transform-runtime']
                        }
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        plugins: [
            new webpack.DefinePlugin({
                APP_VERSION: JSON.stringify(packageJson.version)
            })
        ],
        watchOptions: {
            ignored: /node_modules|dist/,
            aggregateTimeout: 300, // Delay rebuilds slightly
            poll: 1000 // Enable polling (set to undefined if using native FS watchers)
        }
    };
};
