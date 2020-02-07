const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        index: ['./src/script/index.js']
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: true,
        hot: true,
        host: 'localhost',
        port: 80,
        open: false,
        quiet: false,//控制台不显示消息
        watchOptions: {
            poll: false
        },
        disableHostCheck: true,
    },
    output: {
        path: resolve('dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.scss', '.json'],
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader?cacheDirectory',
            },
            exclude: resolve('node_modules'),
            include: resolve('src')
        },
        {
            test: /\.scss$/,
            use: [{
                loader: 'style-loader',
                options: {
                    "sourceMap": true
                }
            }, {
                loader: 'css-loader',
                options: {
                    "sourceMap": true
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    "sourceMap": true
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true,
                }
            }],
            exclude: resolve('node_modules'),
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            exclude: /node_modules/,
            loader: 'file-loader',
            options: {
                name: 'img/[name].[hash:7].[ext]'
            }
        },
        {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'media/[name].[hash:7].[ext]'
            }
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'fonts/[name].[hash:7].[ext]'
            }
        },
        {
            test: /\.(html)$/,
            exclude: /node_modules/,
            use: [{
                loader: 'html-loader',
                options: {
                    minimize: false,
                    interpolate: true,
                    attrs: false
                }
            }]
        },
        {   test: /\.vue$/,
            use: 'vue-loader' 
        },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            favicon: 'favicon.ico',
            inject: true
        }),
        new webpack.ProvidePlugin({ //全局自动加载模块
            Vue: 'vue'
        }),
        new CopyWebpackPlugin([{
            from: resolve('static'),
            to: 'static',
            ignore: ['.*']
        }])
    ]
}