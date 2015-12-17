/*
 * This file is part of FuckFuckAdBlock.
 *
 * FuckFuckAdBlock is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * FuckFuckAdBlock is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with FuckFuckAdBlock.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/*global
    document
 */
var COOKIES = (function (document) {
    'use strict';
    var _COOKIES = COOKIES || {},

        __read_cookies = function () {
            var cookies = {};

            document.cookie.split('; ').forEach(function (item) {
                if (item) {
                    item = item.split('=');
                    cookies[item[0]] = item[1];
                }
            });

            return cookies;
        };

    _COOKIES.get = function (key) {
        return __read_cookies()[key];
    };

    _COOKIES.set = function (key, value) {
        document.cookie = key + '=' + value + ';';
    };

    _COOKIES.remove = function (key) {
        document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    };

    return _COOKIES;
})(document);
