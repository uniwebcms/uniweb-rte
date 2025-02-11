const path = require('path');

module.exports = () => {
    return {
        mode: 'production',
        entry: path.resolve(__dirname, 'src', 'main.js'),
        // entry: {
        //     main: path.resolve(__dirname, 'src', 'main.js')
        // },
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
        }
        // externals: {
        //     // Define external dependencies (if needed), e.g., lodash:
        //     react: 'React',
        //     'react-dom': 'ReactDOM',
        //     'react-router-dom': 'ReactRouterDOM'
        // },
        // externals: {
        //     react: {
        //         commonjs: 'react',
        //         commonjs2: 'react',
        //         amd: 'react',
        //         root: 'React'
        //     },
        //     'react-dom': {
        //         commonjs: 'react-dom',
        //         commonjs2: 'react-dom',
        //         amd: 'react-dom',
        //         root: 'ReactDOM'
        //     },
        //     'react-router-dom': {
        //         commonjs: 'react-router-dom',
        //         commonjs2: 'react-router-dom',
        //         amd: 'react-router-dom',
        //         root: 'ReactRouterDOM'
        //     }
        // }
        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             // Create a separate chunk for citation-js:
        //             citationJs: {
        //                 test: /[\\/]node_modules[\\/]@?citation-js[\\/]/, // adjust if your package is scoped or not
        //                 name: 'citation-js',
        //                 chunks: 'all',
        //                 enforce: true
        //             },
        //             // Optionally, adjust the default vendor chunk so it doesn’t absorb citation-js:
        //             vendors: {
        //                 test: /[\\/]node_modules[\\/](?!@?citation-js)/,
        //                 name: 'vendors',
        //                 chunks: 'all',
        //                 priority: -10
        //             }
        //         }
        //     }
        // }
    };
};
