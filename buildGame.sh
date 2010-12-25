#!/bin/bash
rm -rf src-built

require-js-optimization-tool-0.2.1/build/build.sh app.build.js

echo Cleaning up files we dont need.

cd src-built/css
rm -rf `find . | grep -v 'screen.css' | grep -v -x '.'`
cd ../js
rm -rf `find . | grep -v 'main-client.js' | grep -v -x '.'`
cd ..
rm -f index.html
mv index-built.html index.html