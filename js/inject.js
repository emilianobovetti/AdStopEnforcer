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
    document, SCRIPT
 */
var INJECT = (function (document) {
    'use strict';

    var _INJECT = INJECT || {};

    _INJECT.raw = function (value) {
        return { raw: value };
    };

    _INJECT.emptyFunction = function () {};

    _INJECT.fakeFab = _INJECT.raw('fakeFab');

    _INJECT.fakeFabConstructor = _INJECT.raw('fakeFabConstructor');

    function injectArrayToString (array) {
        array = array.filter(function (x) { return x && x.domainCheck; });

        return '[' + array.reduce(function (acc, x, idx) {
                return acc + (idx ? ',' : '') + x.toString()
            }, '') + ']';
    }

    function defineImmutableProperty (object, key, value) {
        var keyList = typeof key == 'string' ? key.split('.') : key,
            property;

        Object.defineProperty(object, keyList[0], {
            get: function () {
                return property;
            },
            set: function (settedValue) {
                var propertyCopy;

                if (keyList.length == 1) {
                    settedValue = value;
                } else if (settedValue && typeof settedValue == 'object') {
                    propertyCopy = settedValue[keyList[1]];

                    delete settedValue[keyList[1]];

                    defineImmutableProperty(settedValue, keyList.slice(1), value);

                    settedValue[keyList[1]] = propertyCopy;
                }

                property = settedValue;
            }
        });
    }

    function deepMerge (target, source) {
        Object.keys(source).forEach(function (key) {
            if (target[key] && typeof target[key] == 'object' && source[key] && typeof source[key] == 'object') {
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });

        return target;
    }

    function fakeFabConstructor () {
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
    }

    function injectWindowProperties () {
        windowProperties.forEach(function (property) {
            defineImmutableProperty(window, property.key, property.value);

            window[property.key.split('.').shift()] = undefined;
        });
    }

    function injectSetTimeout () {
        var realSetTimeout = window.setTimeout.bind(window);

        if (bannedSetTimeoutNames.length + bannedSetTimeoutContents.length > 0) {
            window.setTimeout = function (fn, timeout) {
                var isBanned = false;

                bannedSetTimeoutNames.forEach(function (bannedName) {
                    isBanned = isBanned || fn.name === bannedName.value;
                });

                bannedSetTimeoutContents.forEach(function (bannedContent) {
                    isBanned = isBanned || fn.toString().indexOf(bannedContent.value) > -1;
                });

                if (isBanned === false) {
                    realSetTimeout(fn, timeout);
                }
            }
        }
    }

    function injectJQuery () {
        var jQuery;

        function jQueryGetter() {
            return jQuery;
        }

        function jQuerySetter(realJQuery) {
            jQuery = function (selector, context) {
                var obj = realJQuery(selector, context);

                jQuerySelectors.forEach(function (item) {
                    if (selector === item.key) {
                        obj = deepMerge(obj, item.value);
                    }
                });

                return obj;
            };

            Object.keys(realJQuery).forEach(function (key) {
                jQuery[key] = realJQuery[key];
            });
        }

        if (jQuerySelectors.length > 0) {
            Object.defineProperty(window, 'jQuery', { get: jQueryGetter, set: jQuerySetter });
            Object.defineProperty(window, '$', { get: jQueryGetter, set: jQuerySetter });
        }
    }

    _INJECT.create = function () {
        var self = {};

        self.script = SCRIPT.create();

        self.windowProperties = function (properties) {
            self.script.pushAssignment('windowProperties', injectArrayToString(properties));
        };

        self.bannedSetTimeoutNames = function (names) {
            self.script.pushAssignment('bannedSetTimeoutNames', injectArrayToString(names));
        };

        self.bannedSetTimeoutContents = function (contents) {
            self.script.pushAssignment('bannedSetTimeoutContents', injectArrayToString(contents));
        };

        self.jQuerySelectors = function (selectors) {
            self.script.pushAssignment('jQuerySelectors', injectArrayToString(selectors));
        };

        self.run = function () {
            setTimeout(function () {
                var scriptElement = document.createElement('script');

                scriptElement.textContent = self.script.render();

                if (self.debug === true) {
                    console.log(scriptElement.textContent);
                }

                (document.head || document.documentElement).appendChild(scriptElement);
                scriptElement.remove();
            }, 10);

            return self;
        }

        self.script.pushAssignment('fakeFab', 'fakeFabConstructor()');

        self.script.pushFunction(fakeFabConstructor);

        self.script.pushFunction(defineImmutableProperty);

        self.script.pushFunction(deepMerge);

        self.script.pushSelfInvoking(injectWindowProperties);

        self.script.pushSelfInvoking(injectSetTimeout);

        self.script.pushSelfInvoking(injectJQuery);

        return self;
    };

    /*
     * inject object initializer
     */
    _INJECT.value = function (value, domains) {
        var self = {};

        self.value = value;

        self.domainCheck = (function () {
            // if domains is a falsy value we want to
            // inject the object (check = true)
            var check = ! domains;

            domains = check ? [] : (typeof domains == 'string') ? [domains] : domains;

            domains.forEach(function (domain) {
                check = check || document.location.hostname.endsWith(domain);
            });

            return check;
        })();

        self.toString = function() {
            var output = '{';

            Object.keys(self).forEach(function (property) {
                var value = self[property];

                // skip these properties
                if (['domainCheck', 'toString'].indexOf(property) > -1) {
                    return;
                }

                output += (output.length > 1 ? ',"' : '"') + property + '":';

                if (value === null) {
                    output += 'null';
                } else if (value === undefined) {
                    output += 'undefined';
                } else if (value.raw) {
                    output += value.raw;
                } else if (typeof value == 'function') {
                    output += value.toString();
                } else {
                    output += JSON.stringify(value);
                }
            });

            output += '}';

            return output;
        };

        return self;
    };

    _INJECT.pair = function (key, value, domains) {
        var self = _INJECT.value(value, domains);

        self.key = key;

        return self;
    };

    return _INJECT;
})(document);
