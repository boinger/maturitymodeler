#!/usr/bin/env bash
#
# * Created by Jeff Vier on 7 Dec 2020
# * https://github.com/boinger/maturitymodeler

npm list -g requirejs || npm install -g requirejs
mkdir dist/ || echo 'dist/ folder already exists...'
cp -f js/require_2_3_6/require.min.js dist/
cp -f favicon.png dist/
node build/r_2_3_6/r.js -o build/build.js
node build/r_2_3_6/r.js -o cssIn=css/radar.css out=dist/main-built.css