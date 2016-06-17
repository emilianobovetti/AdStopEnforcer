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
    document, console, SCRIPT
 */
var INJECT = (function (document) {
    'use strict';

    var _INJECT = INJECT || {},

        script = SCRIPT.create();

    /*
     * Injected functions
     */
    script.pushFunction(function defineImmutableProperty (object, key, value) {
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
    });

    script.pushFunction(function deepMerge (target, source) {
        Object.keys(source).forEach(function (key) {
            if (target[key] && typeof target[key] == 'object' && source[key] && typeof source[key] == 'object') {
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });

        return target;
    });

    script.pushFunction(function nativeCode (fn) {
        fn.toString = function () {
            return 'function ' + fn.name + '() { [native code] }';
        };

        return fn;
    });

    script.pushFunction(function fakeFabConstructor () {
        var self = {};

        self.setOption = function (options, value) {};

        self.check = function (loop) { return true; };

        self.emitEvent = function (detected) { return self; };

        self.clearEvent = function () {};

        self.on = function (detected, fn) { detected || fn(); return self; };

        self.onDetected = function (fn) { return self.on(true, fn); };

        self.onNotDetected = function (fn) { return self.on(false, fn); };

        return self;
    });

    script.pushAssignment('fakeFab', 'fakeFabConstructor()');

    /*
     * Injected self invoking functions
     */
    script.pushSelfInvoking(function injectWindowProperties () {
        windowProperties.forEach(function (property) {
            defineImmutableProperty(window, property.key, property.value);

            window[property.key.split('.').shift()] = undefined;
        });
    });

    script.pushSelfInvoking(function injectSetTimeout () {
        var realSetTimeout = window.setTimeout;

        if (bannedSetTimeoutNames.length + bannedSetTimeoutContents.length == 0) {
            // nothing to ban
            return;
        }

        window.setTimeout = function setTimeout (fn, timeout) {
            var isBanned = false;

            bannedSetTimeoutNames.forEach(function (bannedName) {
                isBanned = isBanned || fn.name === bannedName;
            });

            bannedSetTimeoutContents.forEach(function (bannedContent) {
                isBanned = isBanned || fn.toString().indexOf(bannedContent) > -1;
            });

            isBanned || realSetTimeout(fn instanceof Function ? function () {
                fn.apply(null, Array.prototype.slice.call(arguments, 2));
            } : fn, timeout);
        };

        nativeCode(window.setTimeout);
    });

    script.pushSelfInvoking(function injectJQuery () {
        var jQuery;

        if (jQuerySelectors.length == 0) {
            // nothing to ban
            return;
        }

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

        Object.defineProperty(window, 'jQuery', { get: jQueryGetter, set: jQuerySetter });
        Object.defineProperty(window, '$', { get: jQueryGetter, set: jQuerySetter });
    });

    script.pushFunction(function isBlacklistedId (id) {
        var isBanned = false;

        isBanned = idBlacklist.reduce(function (acc, banned) {
            return acc || id.indexOf(banned) > -1;
        }, isBanned);

        isBanned = idWhitelist.reduce(function (acc, allowed) {
            return acc && id.indexOf(allowed) == -1;
        }, isBanned);

        return isBanned;
    });

    script.pushFunction(function stripUrl (url) {
        if (url.startsWith('//')) {
            return url.substring(2);
        } else if (url.indexOf('://') > -1) {
            return url.split('://')[1];
        } else {
            return url;
        }
    });

    script.pushFunction(function isBlacklistedSrc (src) {
        var url = stripUrl(src);

        return domainBlacklist.reduce(function (acc, banned) {
            return acc || url.startsWith(banned);
        }, false);
    });

    script.pushAssignment('getUniqueElementId', '(' + (function () {
        var uniqueElementId = 0;

        return function getUniqueElementId () {
            return uniqueElementId += 1;
        };
    }).toString() + ')()');

    script.pushAssignment('injectedDescriptors', '[]');

    script.pushFunction(function fakeElement (element, properties) {
        var descriptor;

        function createDescriptor () {
            var key, value, desc = {};

            for (key in element) {
                value = element[key];

                if (typeof value == 'function') {
                    desc[key] = { value: value.bind(element) };
                } else {
                    desc[key] = { value: value };
                }
            }

            desc.__uniqueId = { value: getUniqueElementId() };

            injectedDescriptors[desc.__uniqueId] = desc;

            return desc;
        }

        if (element.__uniqueId !== undefined) {
            descriptor = injectedDescriptors[element.__uniqueId];
        } else {
            descriptor = createDescriptor();
        }

        Object.keys(properties || {}).forEach(function (key) {
            descriptor[key] = { value: properties[key] };
        });

        return Object.create(Element.prototype, descriptor);
    });

    script.pushSelfInvoking(function injectSetAttribute () {
        var realSetAttribute = Element.prototype.setAttribute;

        if (baitClasses.length == 0 && mode !== 'experimental') {
            return;
        }

        Element.prototype.setAttribute = function setAttribute (name, value) {
            var isBanned = false;

            if (name === 'id' && mode === 'experimental') {
                isBanned = isBlacklistedId(value);
            } else if (name === 'src' && mode === 'experimental') {
                isBanned = isBlacklistedSrc(value);
            } else if (name === 'class') {
                isBanned = value.split(' ').reduce(function (acc, item) {
                    return acc || baitClasses.indexOf(item) > -1;
                }, false);
            }

            debug && isBanned && console.log('[FuckFuckAdBlock]', '[banned attribute]', name, value);

            isBanned || realSetAttribute.call(this, name, value);
        };

        nativeCode(Element.prototype.setAttribute);
    });

    script.pushSelfInvoking(function injectGetElementById () {
        var realGetElementById = document.getElementById.bind(document),
            mapIdFakeElement = {};

        if (mode !== 'experimental') {
            return;
        }

        document.getElementById = function getElementById (id) {
            var element, fake;

            if (mapIdFakeElement[id]) {
                return mapIdFakeElement[id];
            }

            element = realGetElementById(id);

            if ( ! element || ! isBlacklistedId(id)) {
                return element;
            }

            fake = fakeElement(element, { offsetParent: document.body });
            //fake = fakeElement(element);

            debug && console.log('[FuckFuckAdBlock]', '[fake elementById]', id, fake);

            return mapIdFakeElement[id] = fake;
        };

        nativeCode(document.getElementById);
    });

    script.pushSelfInvoking(function injectCreateElement () {
        var realCreateElement = document.createElement.bind(document);

        if (mode !== 'experimental') {
            return;
        }

        document.createElement = function createElement (tagName) {
            var element = realCreateElement(tagName),
                id, src;

            Object.defineProperty(element, 'id', {
                get: function () { return id; },

                set: function (x) { element.setAttribute('id', id = x); }
            });

            Object.defineProperty(element, 'src', {
                get: function () { return src; },

                set: function (x) { element.setAttribute('src', src = x); }
            });

            return element;
        };

        nativeCode(document.createElement);
    });

    script.pushSelfInvoking(function injectGetComputedStyle () {
        var realGetComputedStyle = window.getComputedStyle;

        if (mode !== 'experimental') {
            // if no fake element is returned from
            // document.getElementById, there is no need
            // to inject window.getComputedStyle
            return;
        }

        window.getComputedStyle = function getComputedStyle (element, pseudoElt) {
            if (element.__uniqueId !== undefined) {
                debug && console.log('[FuckFuckAdBlock]', '[getComputedStyle]', element);

                return { display: 'block' }; // TODO
            } else {
                return realGetComputedStyle(element, pseudoElt);
            }
        };

        nativeCode(window.getComputedStyle);
    });

    script.pushSelfInvoking(function injectAppendChild () {
        var realAppendChild = Node.prototype.appendChild;

        if (mode !== 'experimental') {
            return;
        }

        Node.prototype.appendChild = function appendChild (child) {
            if (child.__uniqueId !== undefined) {
                debug && console.log('[FuckFuckAdBlock]', '[appendChild]', child);

                return fakeElement(child, { offsetParent: this });
            } else {
                return realAppendChild.call(this, child);
            }
        };

        nativeCode(Node.prototype.appendChild);
    });

    script.pushSelfInvoking(function injectRemoveChild () {
        var realRemoveChild = Node.prototype.removeChild;

        if (mode !== 'experimental') {
            return;
        }

        Node.prototype.removeChild = function removeChild (child) {
            if (child.__uniqueId !== undefined) {
                debug && console.log('[FuckFuckAdBlock]', '[removeChild]', child);

                return fakeElement(child, { offsetParent: null });;
            } else {
                return realRemoveChild.call(this, child);
            }
        };

        nativeCode(Node.prototype.removeChild);
    });

    script.pushSelfInvoking(function injectImageConstructor () {
        var realImageConstructor = window.Image;

        if (mode !== 'experimental') {
            return;
        }

        window.Image = function HTMLImageElement (width, height) {
            var element = new realImageConstructor(width, height),
                src;

            Object.defineProperty(element, 'src', {
                get: function () { return src; },

                set: function (x) { element.setAttribute('src', src = x); }
            });

            return element;
        };

        nativeCode(window.Image);
    });

    /*
     * Returns a string representing the source of the array.
     *
     * INJECT objects are filtered for the domainCheck property
     * and their toString method is called to get their source.
     *
     * For every other value JSON.stringify is used to get
     * the value's source.
     */
    function injectArrayToString (array) {
        return array.reduce(function (acc, item, index) {
            if ( ! item || item.domainCheck === false) {
                return acc;
            }

            if (index > 0) {
                acc += ',';
            }

            if (item.domainCheck === true) {
                acc += item.toString();
            } else {
                acc += JSON.stringify(item);
            }

            return acc;
        }, '[') + ']';
    }

    /*
     * Create new INJECT instance
     */
    _INJECT.create = function () {
        var self = {};

        self.script = script;

        self.mode = 'normal';

        self.debug = false;

        self.normal = {};

        self.experimental = {};

        self.run = function () {
            if (self.mode === 'off') {
                return self;
            }

            if (self.mode !== 'experimental') {
                self.experimental = {};
            }

            self.script.pushAssignment('mode', '"' + self.mode + '"');
            self.script.pushAssignment('debug', self.debug === true);

            Object.keys(self.normal).forEach(function (name) {
                self.script.pushAssignment(name, injectArrayToString(self.normal[name]));
            });

            Object.keys(self.experimental).forEach(function (name) {
                self.script.pushAssignment(name, injectArrayToString(self.experimental[name]));
            });

            setTimeout(function () {
                var scriptElement = document.createElement('script');

                scriptElement.textContent = self.script.render();

                (document.head || document.documentElement).appendChild(scriptElement);
                scriptElement.remove();
            }, 10);

            return self;
        };

        return self;
    };

    _INJECT.raw = function (value) {
        return { raw: value };
    };

    _INJECT.emptyFunction = function () {};

    _INJECT.fakeFab = _INJECT.raw('fakeFab');

    _INJECT.fakeFabConstructor = _INJECT.raw('fakeFabConstructor');

    /*
     * Converts value to string
     */
    function valueToString (value) {
        if (value === null) {
            return 'null';
        } else if (value === undefined) {
            return 'undefined';
        } else if (value.raw) {
            return value.raw;
        } else if (typeof value == 'function') {
            return value.toString();
        } else {
            return JSON.stringify(value);
        }
    }

    /*
     * Create new INJECT.value
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
            return valueToString(self.value);
        };

        return self;
    };

    /*
     * Create new INJECT.pair
     */
    _INJECT.pair = function (key, value, domains) {
        var self = _INJECT.value(value, domains);

        self.key = key;

        self.toString = function() {
            var out = '{';

            Object.keys(self).forEach(function (property) {
                // skip these properties
                if (['domainCheck', 'toString'].indexOf(property) > -1) {
                    return;
                }

                out += (out.length > 1 ? ',"' : '"') + property + '":' + valueToString(self[property]);
            });

            return out + '}';
        };

        return self;
    };

    return _INJECT;

})(document);
