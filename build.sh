#!/bin/bash

#
# This file is part of FuckFuckAdBlock.
#
# FuckFuckAdBlock is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# FuckFuckAdBlock is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with FuckFuckAdBlock.  If not, see <http://www.gnu.org/licenses/>.
#

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR="$BASE_DIR/build"
CHROME_BUILD_DIR="$BUILD_DIR/chrome"
FIREFOX_BUILD_DIR="$BUILD_DIR/firefox"

rm -rf "$BUILD_DIR"

test -d "$CHROME_BUILD_DIR" || mkdir -p "$CHROME_BUILD_DIR"
cp -r icons js chrome.manifest.json "$CHROME_BUILD_DIR"
mv "$CHROME_BUILD_DIR/chrome.manifest.json" "$CHROME_BUILD_DIR/manifest.json"

test -d "$FIREFOX_BUILD_DIR" || mkdir -p "$FIREFOX_BUILD_DIR"
cp -r icons js firefox.manifest.json "$FIREFOX_BUILD_DIR"
mv "$FIREFOX_BUILD_DIR/firefox.manifest.json" "$FIREFOX_BUILD_DIR/manifest.json"

cd "$CHROME_BUILD_DIR" && zip ../chrome.zip -r .
cd "$FIREFOX_BUILD_DIR" && zip ../firefox.xpi -r .
