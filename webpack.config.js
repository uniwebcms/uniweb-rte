const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = (env, argv) => {
    return {
        mode: argv.mode || 'production',
        entry: path.resolve(__dirname, 'src', 'main.js'),
        output: {
            // filename: '[name].[contenthash].js',
            filename: '[name].js',
            chunkFilename: '[name].[contenthash].js',
            // chunkFilename: '[name].js',
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
            ignored: /node_modules|dist/, // Ignore node_modules and dist folder
            aggregateTimeout: 300, // Delay rebuilds slightly
            poll: 1000 // Enable polling (set to undefined if using native FS watchers)
        }
    };
};
