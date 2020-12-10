#!/usr/bin/env bash
#
# * Created by Jeff Vier on 7 Dec 2020
# * https://github.com/boinger/maturitymodeler

#TERSER_OPTS="--compress --mangle"

if [ "$1" != "fast" ]; then
  npm list -g requirejs || npm install -g requirejs
  npm list -g terser || npm install -g terser
  mkdir dist/ || echo 'dist/ folder already exists...'
fi
cp -f js/require_2_3_6/require.min.js dist/
cp -f favicon.png dist/
node build/r_2_3_6/r.js -o build/build.js
terser dist/main-built.js ${TERSER_OPTS} > dist/main-built.min.js && mv dist/main-built.min.js dist/main-built.js
node build/r_2_3_6/r.js -o cssIn=css/radar.css out=dist/main-built.css
