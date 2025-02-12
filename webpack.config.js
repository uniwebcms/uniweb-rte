const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = () => {
    return {
        mode: 'production',
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
                name: 'uniwebRe',
                type: 'umd', // Supports CommonJS, AMD, and global variables
                umdNamedDefine: true
            },
            globalObject: 'this' // Ensures compatibility in both Node.js & browser
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
        ]
    };
};
