import esbuild from 'esbuild';
import fs from 'fs';
import servor from 'servor';
import {sassPlugin} from 'esbuild-sass-plugin';

const PORT = '8080';
const OUTPUT_DIR = 'build';
const MODE = process.env.NODE_ENV;

const config = {
  bundle: true,
  minify: (MODE === 'production')
    ? true
    : false,
  plugins: [
    sassPlugin({
      implementation: 'node-sass',
    }),
  ],
  sourcemap: false,
  watch: (MODE === 'production')
    ? false
    : true,
}

/** Spins up server. */
async function serve() {
  console.log(`running server from: http://localhost:${PORT}/`);
  await servor({
    browser: true,
    root: OUTPUT_DIR,
    port: 8080,
  });
}

/** Copies files to build directory. */
async function copy() {
  fs.copyFile('src/index.html', `${OUTPUT_DIR}/index.html`, (err) => {
    if (err) {
      throw err;
    }
  });
}

await esbuild.build(Object.assign({
    entryPoints: [
      'src/index.ts',
    ],
    outfile: `${OUTPUT_DIR}/index.min.js`,
  }, config))
.then(esbuild.build(Object.assign({
    entryPoints: [
      'src/index.scss',
    ],
    loader: {
      '.eot': 'dataurl',
      '.woff': 'dataurl',
      '.ttf': 'dataurl',
      '.svg': 'dataurl',
      '.otf': 'dataurl'
    },
    outfile: `${OUTPUT_DIR}/index.min.css`,
  }, config)))
.then(copy)
.then(() => {
  // if (MODE === 'production') {
  //   process.exit(1);
  // }
})
.catch(() => {
  process.exit(1);
});

if (MODE === 'development') {
  serve();
}



