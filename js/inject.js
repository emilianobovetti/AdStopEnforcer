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
    document, setInterval, clearInterval, COOKIES
 */
(function (document) {
    'use strict';

    var faker = '(' + (function () {
            var self = {
                on: function(detected, fn) {
                    if (detected) {
                        return self;
                    } else {
                        fn();
                        return self;
                    }
                },

                onDetected: function (fn) {
                    return self.on(true, fn);
                },

                onNotDetected: function (fn) {
                    return self.on(false, fn);
                }
            };

            return self;
        }).toString() + ')()',

        fakerConstructor = 'function () { return ' + faker + '; }',

        windowProperties = [
            inject('fuckAdBlock', faker),
            inject('blockAdBlock', faker),
            inject('sniffAdBlock', faker),
            inject('cadetect', faker),
            inject('FuckAdBlock', fakerConstructor),
            inject('BlockAdBlock', fakerConstructor),
            inject('is_adblock_detect', 'false'),
            inject('fbs_settings', '{ classes: "e30=" }', 'forbes.com') // danger: untested
        ],

        cookies = [
            inject('xclsvip', '1', 'vipbox.tv')
        ],

        injectInterval;

    /*
     * inject object initializer
     */
    function inject(name, value, domains) {
        // if domains is a falsy value we want to
        // inject the object (domainCheck = true)
        var domainCheck = ! domains;

        domains = domainCheck ? [] : (typeof domains == 'string') ? [domains] : domains;

        domains.forEach(function (domain) {
            if (document.location.host.indexOf(domain) > -1) {
                domainCheck = true;
            }
        });

        return {
            name: name,
            value: value,
            domainCheck: domainCheck,
            attempts: 10
        };
    }

    /*
     * Injectors
     */
    function windowPropertyInjector(inject) {
        var script = document.createElement('script');

        if ( ! document.head) {
            return false;
        }

        script.innerHTML = 'Object.defineProperty(window, "' + inject.name + '"'
            + ', { value: ' + inject.value + ', writable: false, configurable: false });';

        document.head.appendChild(script);

        return true;
    }

    function cookieInjector(inject) {
        COOKIES.set(inject.name, inject.value);

        if (COOKIES.get(inject.name) == inject.value) {
            return true;
        } else {
            return false;
        }
    }

    /*
     * Run injections
     */
    function runInjection(injector, toInject) {
        // run injection for each element in list
        toInject.forEach(function (element, index) {

            if ( element.attempts == 0 || ! element.domainCheck || injector(element)) {
                // if current element doesn't have to be injected,
                // was successfully injected,
                // or attemps number is 0
                // we can remove it from the list
                toInject.splice(index, 1);
            }

            element.attempts -= 1;
        });
    }

    function mainInjection() {
        // inject all window properties
        runInjection(windowPropertyInjector, windowProperties);

        // inject all cookies
        runInjection(cookieInjector, cookies);

        if (windowProperties.length + cookies.length == 0) {
            clearInterval(injectInterval);
        }
    }

    injectInterval = setInterval(mainInjection, 100);
})(document);
