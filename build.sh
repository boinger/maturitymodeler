#!/usr/bin/env bash
#
# * Created by Jeff Vier on 7 Dec 2020
# * Optimized webpack-only build
# * https://github.com/boinger/maturitymodeler

# Check dependencies for fast builds
if [ "$1" != "fast" ]; then
  mkdir dist/ || echo 'dist/ folder already exists...'
fi

# Create optimized webpack bundle (primary build artifact)
echo "Creating optimized webpack bundle..."
npx webpack --mode=production

# Copy and minify CSS (aggressive minification)
echo "Optimizing CSS..."
# Aggressive CSS minification: remove comments, whitespace, unnecessary semicolons
sed 's|/\*[^*]*\*\+\([^/*][^*]*\*\+\)*/||g; s/[[:space:]]\+/ /g; s/; /;/g; s/ {/{/g; s/{ /{/g; s/} /}/g; s/: /:/g; s/, /,/g; s/;}$/}/g; s/;}/}/g' css/spider.css | tr -d '\n' | sed 's/  */ /g; s/^ *//; s/ *$//' > dist/main-built.css

# Copy favicon
cp -f favicon.png dist/

# Create minified HTML
echo "Minifying HTML..."
sed 's|<!--[^>]*-->||g; s/[[:space:]]\+/ /g; s/> </></g; s/^ *//; s/ *$//; s/ \+/ /g' index.html | tr -d '\n' | sed 's|<base href="dist/" target="_blank">|<base href="./" target="_blank">|' > dist/index.html

# Create compressed versions for better server delivery
echo "Creating compressed versions..."
if command -v gzip &> /dev/null; then
    gzip -9 -k -f dist/main.bundle.js
    gzip -9 -k -f dist/main-built.css
    gzip -9 -k -f dist/index.html
    echo "Gzip compression: JS $(du -h dist/main.bundle.js.gz | cut -f1), CSS $(du -h dist/main-built.css.gz | cut -f1), HTML $(du -h dist/index.html.gz | cut -f1)"
fi

if command -v brotli &> /dev/null; then
    brotli -9 -k -f dist/main.bundle.js
    brotli -9 -k -f dist/main-built.css  
    brotli -9 -k -f dist/index.html
    echo "Brotli compression: JS $(du -h dist/main.bundle.js.br | cut -f1), CSS $(du -h dist/main-built.css.br | cut -f1), HTML $(du -h dist/index.html.br | cut -f1)"
fi

echo "Optimized build complete!"
echo "Bundle size: $(du -h dist/main.bundle.js | cut -f1)"
echo "CSS size: $(du -h dist/main-built.css | cut -f1)"
echo "HTML size: $(du -h dist/index.html | cut -f1)"