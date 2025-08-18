#!/usr/bin/env bash
#
# * Created by Jeff Vier on 7 Dec 2020
# * Modified for ES modules
# * https://github.com/boinger/maturitymodeler

#TERSER_OPTS="--compress --mangle"

if [ "$1" != "fast" ]; then
  npm list -g terser || npm install -g terser
  mkdir dist/ || echo 'dist/ folder already exists...'
fi

# Copy favicon
cp -f favicon.png dist/

# For ES modules, we need to copy the entire JS structure
cp -rf js/ dist/js/
cp -f app.js dist/main-built.js

# Minify the main entry point
terser dist/main-built.js ${TERSER_OPTS} > dist/main-built.min.js && mv dist/main-built.min.js dist/main-built.js

# Copy CSS directly since we're not using RequireJS optimizer
cp -f css/radar.css dist/main-built.css

echo "ES module build complete!"