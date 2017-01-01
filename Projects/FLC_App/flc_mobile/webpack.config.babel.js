import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

module.exports = {
    entry: {
        "eventsEntry": './www/js/events.js',
        "indexEntry": './www/js/index.js',
        "mapEntry": './www/js/map.js',
        "professorsEntry": './www/js/professors.js',
        "scheduleEntry": './www/js/schedule.js',
        "scrollEntry": './www/js/scroll.js',
    },
    target: 'web',
    exclude: /node_modules/,
    output: {
        path: './build',
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, './www/js'),
                ]
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader',
            },
        ],
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false,
        //     },
        //     output: {
        //         comments: false,
        //     },
        // }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        new ExtractTextPlugin("[name].css"),
    ],
};
