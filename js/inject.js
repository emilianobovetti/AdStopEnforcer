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

(function (document) {
    'use strict';
    var allDomains = '<all>',

        inject = function (name, value, domains) {
            domains = domains || [allDomains];

            if (typeof domains === 'string') {
                domains = [domains];
            }

            return { name: name, value: value, domains: domains };
        },

        windowProperties = [
            inject('fuckAdBlock', null),
            inject('is_adblock_detect', false)
        ],

        cookies = [
            inject('xclsvip', 1, 'vipbox.tv')
        ],

        injectInterval;

    /*
     * Injectors
     */
    function windowPropertyInjector (inject) {
        var script = document.createElement('script');

        if ( ! document.head) {
            return false;
        }

        script.innerHTML = "Object.defineProperty(window, '" + inject.name
            + "', { value: " + inject.value + ", writable: false, configurable: false });";

        document.head.appendChild(script);

        return true;
    }

    function cookieInjector (inject) {
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
        toInject.forEach(function(element, index) {
            var domainCheck = false;

            element.domains.forEach(function (domain) {
                if (domain === allDomains || document.location.host.indexOf(domain) > -1) {
                    domainCheck = true;
                }
            });

            if ( ! domainCheck || injector(element)) {
                // if current element doesn't have to be injected
                // or was successfully injected,
                // we can remove it from the list
                toInject.splice(index, 1);
            }
        });
    }

    function mainInjection () {
        // inject all window properties
        runInjection(windowPropertyInjector, windowProperties);

        // inject all cookies
        runInjection(cookieInjector, cookies);

        if (windowProperties.length + cookies.length === 0) {
            clearInterval(injectInterval);
        }
    }

    injectInterval = setInterval(mainInjection, 100);
})(document);
