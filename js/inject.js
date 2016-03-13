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

var INJECT = (function () {
    'use strict';
    var _INJECT = INJECT || {},

        __domainCheck = function (domains) {
            // if domains is a falsy value we want to
            // inject the object (check = true)
            var check = ! domains;

            domains = check ? [] : (typeof domains == 'string') ? [domains] : domains;

            domains.forEach(function (domain) {
                if (document.location.host.indexOf(domain) > -1) {
                    check = true;
                }
            });

            return check;
        };

    _INJECT.emptyFunction = 'function () {}';

    _INJECT.fakeFab = '(' + (function () {
        var self = {
            on: function (detected, fn) {
                if ( ! detected) {
                   fn();
                }

                return self;
            },

            onDetected: function (fn) {
                return self.on(true, fn);
            },

            onNotDetected: function (fn) {
                return self.on(false, fn);
            }
        };

        return self;
    }).toString() + ')()';

    _INJECT.fakeFabConstructor = 'function () { return ' + _INJECT.fakeFab + '; }';

    _INJECT.fakeSetTimeout = function (bannedTimeoutFunctions) {
        bannedTimeoutFunctions = bannedTimeoutFunctions
            .filter(function (x) { return x.domainCheck; })
            .map(function (x) { return x.value; });

        if (bannedTimeoutFunctions.length > 0) {
            return "var bannedTimeoutFunctions = ['"
                +       bannedTimeoutFunctions.join("','") + "'];"
                + "var realSetTimeout = (function () { return setTimeout; })();"
                + "setTimeout = function (fn, timeout) {"
                + "     var banned = false;"
                + "     if (fn.name && bannedTimeoutFunctions.length > 0) {"
                + "         bannedTimeoutFunctions.forEach(function (item) {"
                + "             if (fn.name === item) banned = true;"
                + "         });"
                + "     }"
                + "     if ( ! banned) realSetTimeout(fn, timeout);"
                + "};";
        } else {
            return "";
        }
    };

    /*
     * inject object initializer
     */
    _INJECT.value = function (value, domains) {
        return {
            value: value,
            domainCheck: __domainCheck(domains),
            attempts: 10,
            toString: function () { return value }
        };
    };

    _INJECT.pair = function (key, value, domains) {
        return {
            key: key,
            value: value,
            domainCheck: __domainCheck(domains),
            attempts: 10
        };
    };

    return _INJECT;
})();
