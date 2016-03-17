#!/bin/bash

CHROME_BUILD_DIR=build/chrome
FIREFOX_BUILD_DIR=build/firefox

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CHROME_BUILD_DIR="$BASE_DIR/$CHROME_BUILD_DIR"
FIREFOX_BUILD_DIR="$BASE_DIR/$FIREFOX_BUILD_DIR"

test -d "$CHROME_BUILD_DIR" || mkdir -p "$CHROME_BUILD_DIR"
cp -r icons js chrome.manifest.json "$CHROME_BUILD_DIR"
mv "$CHROME_BUILD_DIR/chrome.manifest.json" "$CHROME_BUILD_DIR/manifest.json"

test -d "$FIREFOX_BUILD_DIR" || mkdir -p "$FIREFOX_BUILD_DIR"
cp -r icons js firefox.manifest.json "$FIREFOX_BUILD_DIR"
mv "$FIREFOX_BUILD_DIR/firefox.manifest.json" "$FIREFOX_BUILD_DIR/manifest.json"

cd "$CHROME_BUILD_DIR" && zip ../chrome.zip -r .
cd "$FIREFOX_BUILD_DIR" && zip ../firefox.xpi -r .
