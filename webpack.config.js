var version = require('./package.json').version;
var path = require( 'path' );

const babelSettings = {
  plugins: [
    'transform-flow-strip-types',
    'add-module-exports',
    'transform-regenerator',
    'transform-decorators-legacy'
  ],
  presets: [ 'es2015', 'stage-1' ]
};


module.exports = [
    {
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: './',
          libraryTarget: 'amd'
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
