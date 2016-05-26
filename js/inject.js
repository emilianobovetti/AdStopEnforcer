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
                check = check || document.location.hostname.endsWith(domain);
            });

            return check;
        },

        __setTimeoutInhibitor = function (bannedArray, bannedCondition) {
            bannedArray = bannedArray
                .filter(function (x) { return x.domainCheck; })
                .map(function (x) { return x.value; });

            if (bannedArray.length == 0) {
                return null;
            }

            return '(function () {'
                + ' var bannedArray = ["' + bannedArray.join('","') + '"],'
                + '     realSetTimeout = window.setTimeout;'

                + ' window.setTimeout = function (fn, timeout) {'
                + '     var isBanned = false;'
                + '     bannedArray.forEach(function (bannedItem) {'
                + '         if (' + bannedCondition + ') isBanned = true;'
                + '     });'
                + '     if ( ! isBanned) realSetTimeout(fn, timeout);'
                + ' };'
                + '})();';
        };

    _INJECT.setTimeoutNameInhibitor = function (bannedSetTimeoutNames) {
        return __setTimeoutInhibitor(bannedSetTimeoutNames, 'fn.name === bannedItem');
    };

    _INJECT.setTimeoutContentInhibitor = function (bannedSetTimeoutContents) {
        return __setTimeoutInhibitor(bannedSetTimeoutContents, 'fn.toString().indexOf(bannedItem) > -1');
    };

    _INJECT.windowProperty = function (inject) {
        var propertyList = inject.key.split('.'),
            property = propertyList.shift();

        function __defineProperty (object, property, propertyList) {
            var propertyListCopy = propertyList.slice();

            // TODO check if 'newValue' is object
            return propertyList.length == 0
                ? 'Object.defineProperty(' + object + ', "' + property + '", {'
                + ' value: ' + inject.value + ','
                + ' writable: false,'
                + ' configurable: false'
                + '});'

                : '(function () {'
                + ' var property;'
                + ' Object.defineProperty(' + object + ', "' + property + '", {'
                + '     get: function () {'
                + '         return property;'
                + '     },'
                + '     set: function (newValue) {'
                + '         var newProperty = newValue.' + propertyList[0] + ';'
                + '         delete newValue.' + propertyList[0] + ';'
                +           __defineProperty('newValue', propertyListCopy.shift(), propertyListCopy)

                + (propertyList.length > 1
                ? '         if (newProperty !== undefined) {'
                + '             newValue.' + propertyList[0] + ' = newProperty;'
                + '         }'
                : '')

                + '         property = newValue;'
                + '     }'
                + ' });'
                + '})();'
        }

        return __defineProperty('window', property, propertyList);
    };

    _INJECT.jQuerySelectorFilter = function (filteredSelectors) {
        filteredSelectors = filteredSelectors.filter(function (x) { return x.domainCheck; });

        if (filteredSelectors.length == 0) {
            return null;
        }

        return '(function () {'
            + ' var jQuery,'
            + '     filteredSelectors = [' + filteredSelectors
                .reduce(function (acc, x, idx) { return acc + (idx ? ', ' : '') + '{ key: "' + x.key + '", value: ' + x.value + ' }'; }, '') + '];'

            + ' function deepMerge (target, source) {'
            + '     Object.keys(source).forEach(function (key) {'
            + '         if (target[key] && typeof target[key] == "object" && source[key] && typeof source[key] == "object") {'
            + '             target[key] = deepMerge(target[key], source[key]);'
            + '         } else {'
            + '             target[key] = source[key];'
            + '         }'
            + '     });'
            + '     return target;'
            + ' }'

            + ' function jQueryGetter() {'
            + '     return jQuery;'
            + ' }'

            + ' function jQuerySetter(realJQuery) {'
            + '     jQuery = function (selector, context) {'
            + '         var obj = realJQuery(selector, context);'

            + '         filteredSelectors.forEach(function (item) {'
            + '             if (selector === item.key) {'
            + '                 obj = deepMerge(obj, item.value);'
            + '             }'
            + '         });'
            + '         return obj;'
            + '     };'
            + '     Object.keys(realJQuery).forEach(function (key) {'
            + '         jQuery[key] = realJQuery[key];'
            + '     });'
            + ' }'

            + ' Object.defineProperty(window, "jQuery", { get: jQueryGetter, set: jQuerySetter });'
            + ' Object.defineProperty(window, "$", { get: jQueryGetter, set: jQuerySetter });'
            + '})();';
    };

    _INJECT.emptyFunction = 'function () {}';

    _INJECT.fakeFab = '(' + (function () {
        var self = {
            setOption: function (options, value) {},

            check: function (loop) { return true; },

            emitEvent: function (detected) { return self; },

            clearEvent: function () {},

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

    /*
     * inject object initializer
     */
    _INJECT.value = function (value, domains) {
        return {
            value: value,
            domainCheck: __domainCheck(domains),
            attempts: 10
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
