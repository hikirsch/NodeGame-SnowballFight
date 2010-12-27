#!/bin/bash

# colors! :-)
TEXTBOLD=$(tput bold)
TEXTUNDERLINE=$(tput sgr 0 1)
COLORRED=$(tput setaf 1)
COLORGREEN=$(tput setaf 2)
COLORYELLOW=$(tput setaf 3)
COLORBLUE=$(tput setaf 4)
COLORPURPLE=$(tput setaf 5)
COLORCYAN=$(tput setaf 6)
COLORRESET=$(tput sgr0)

# we need to go into the folder this script lives in first before we do anything
cd `dirname $0`

# the log file
LOG_FILE=`pwd`/build.log

# removing previous log file
rm -f $LOG_FILE

echo -ne ${COLORCYAN}${TEXTBOLD}
echo "---------------------------------------------------------"
echo "|          NodeGame-SnowballFight Build Script          |"
echo "---------------------------------------------------------"
echo -ne "${COLORRESET}"

if [ -d ../deploy ]; then
	echo -ne " Removing previous deploy folder .................. "
	rm -rf ../deploy 1>>$LOG_FILE 2>>$LOG_FILE
	echo "${COLORGREEN}[OK]${COLORRESET}"
fi

echo -ne " Running Require.JS Optimization Tool v0.2.1 ...... "
require-js-optimization-tool-0.2.1/build/build.sh app.build.js 1>>$LOG_FILE 2>>$LOG_FILE
echo "${COLORGREEN}[OK]${COLORRESET}"

cd ../deploy

echo -ne " Removing build.txt artifact from Require.JS ...... "
rm -f build.txt
echo "${COLORGREEN}[OK]${COLORRESET}"

echo -ne " Removing raw source files ........................ "
cd css
rm -rf `find . | grep -v 'screen.css' | grep -v -x '.'` 1>>$LOG_FILE 2>>$LOG_FILE
cd ../js
rm -rf `find . | grep -v 'main-client.js' | grep -v -x '.'` 1>>$LOG_FILE 2>>$LOG_FILE
echo "${COLORGREEN}[OK]${COLORRESET}"

cd ..

echo -ne " Prepping index.html .............................. "

rm -f index.html 1>>$LOG_FILE 2>>$LOG_FILE
mv index-built.html index.html 1>>$LOG_FILE 2>>$LOG_FILE
echo "${COLORGREEN}[OK]${COLORRESET}"

echo ""

echo " ${TEXTBOLD}${COLORGREEN}Build complete!${COLORRESET}"
echo "   Raw Log:     ${COLORCYAN}${TEXTUNDERLINE}${LOG_FILE}${COLORRESET}"
echo "   Deploy Path: ${COLORCYAN}${TEXTUNDERLINE}$PWD${COLORRESET}"

echo "${COLORRESET}"