/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');

const env = process.env.NODE_ENV;

const config = (isDebug) => {
    const isDevBuild = isDebug;

    // Configuration in common to both client-side and server-side bundles
    const sharedConfig = () => ({
        mode: isDevBuild ? 'development' : 'production',
        stats: { modules: false },
        resolve: { 
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        output: {
            filename: '[name].js',
            // publicPath: 'dist/' // Webpack dev middleware, if enabled, handles requests for this URL prefix
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    extractComments: false,
                    sourceMap: true,
                    uglifyOptions: {
                        mangle: true,
                        comments: false,
                    }
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessor: require('cssnano'),
                    cssProcessorPluginOptions: {
                        preset: ['default', { discardComments: { removeAll: true } }],
                    },
                }),

            ]
        },
        module: {
            rules: [
                {
                    test: /\.ts[x]?$/, include: /client/,
                    exclude: /node_modules/,
                    loader: 'awesome-typescript-loader',
                    options: {
                        useBabel: true,
                    },
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
                {
                    // test: /\.(png|jpg|gif|svg)$/,
                    test: /\.(woff(2)?|ttf|eot|svg|otf|png|jpg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader',
                    options: {
                        name: '../[name].[ext]',
                    }
                },                
                {
                    test: /\.s?[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.js$/,
                    use: ["source-map-loader"],
                    enforce: "pre"
                },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
            ]
        },
        plugins: [
            new CheckerPlugin(),
            new TsConfigPathsPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            new CopyWebpackPlugin([
                { from: './assets/images', to: '../images' },
                { from: './robots.txt', to: './../../' },
            ]),
        ]
    });

    // Configuration for client-side bundle suitable for running in browsers
    const clientBundleOutputDir = './wwwroot/dist/';
    const clientBundleConfig = merge(sharedConfig(), {
        // entry: { 'main-client': './client/boot-client.tsx' },
        entry: { 'main-client': ['whatwg-fetch', 'babel-polyfill','./client/boot-client.tsx'] },
        module: {
          rules: [
           
          ]
        },
        output: { path: path.join(__dirname, clientBundleOutputDir) },
        plugins: [
          new MiniCssExtractPlugin({filename : 'site.css'}),
          new webpack.DllReferencePlugin({
              context: __dirname,
              manifest: require('./wwwroot/dist/vendor-manifest.json')
          })
        ],
        optimization: {
          minimize: !isDevBuild
        },
        devtool: isDevBuild ? 'inline-source-map' : 'source-map'
    });

    // Configuration for server-side (prerendering) bundle suitable for running in Node
    const serverBundleConfig = merge(sharedConfig(), {
        resolve: { mainFields: ['main'] },
        entry: { 'main-server': './client/boot-server.tsx' },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./wwwroot/dist/server/vendor-manifest.json'),
                sourceType: 'commonjs2',
                name: './vendor'
            })
        ],
        output: {
            libraryTarget: 'commonjs',
            path: path.join(__dirname, 'wwwroot', 'dist', 'server')
        },
        target: 'node',
        devtool: isDevBuild ? 'inline-source-map' : 'source-map'
    });

    return [clientBundleConfig, serverBundleConfig];
};

module.exports = config(isDebug);
