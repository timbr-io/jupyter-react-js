var webpack = require('webpack');

const babelSettings = {
  plugins: [
    'transform-flow-strip-types',
    'add-module-exports',
    'transform-regenerator',
    'transform-decorators-legacy'
  ],
  presets: [ 'es2015', 'react', 'stage-1' ]
};


module.exports = [
    {
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: './',
          libraryTarget: 'amd'
      },
      externals: {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom'
        }
      },
      module : {
        loaders : [
          {
            test: /\.js?$/,
            exclude: /(node_modules)/,
            loaders: [`babel?${JSON.stringify( babelSettings )}`]
          }
        ]
      }
    }
];
