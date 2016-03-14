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
    document, setInterval, clearInterval, INJECT, COOKIES
 */
(function (document) {
    'use strict';

        /*
         * Array of INJECT.pair() objects which contain variabile names
         * and values to be injected.
         * They can't be overridden.
         */
    var windowProperties = [
            INJECT.pair('fuckAdBlock', INJECT.fakeFab),
            INJECT.pair('blockAdBlock', INJECT.fakeFab),
            INJECT.pair('sniffAdBlock', INJECT.fakeFab),
            INJECT.pair('cadetect', INJECT.fakeFab),
            INJECT.pair('FuckAdBlock', INJECT.fakeFabConstructor),
            INJECT.pair('BlockAdBlock', INJECT.fakeFabConstructor),
            INJECT.pair('is_adblock_detect', 'false'),
            INJECT.pair('onAdBlockStart', INJECT.emptyFunction),

            INJECT.pair('fbs_settings', '{ classes: "WyJhIiwiYiJd" }', 'forbes.com'),
            INJECT.pair('CWTVIsAdBlocking', INJECT.emptyFunction, 'cwtv.com'),
            INJECT.pair('xaZlE', INJECT.emptyFunction, 'kisscartoon.me')
        ],

        /*
         * Array of INJECT.value() objects which contain function names
         * that can't be called through setTimeout().
         *
         * Note that setTimeoutNameInhibitor function won't be injected if nothing
         * have to be injected, so use domain specific values.
         */
        bannedTimeoutNames = [
            INJECT.value('adsBlock', 'el-nation.com')
        ],

        /*
         * Values in this array cannot appear in code of functions that
         * are passed to setTimeout().
         *
         * This can be CPU intensive.
         */
        bannedTimeoutContents = [
            INJECT.value('displayAdBlockMessage', 'forbes.com')
        ],

        /*
         * Array of INJECT.pair() objects which contain cookie names
         * and values to be injected.
         */
        cookies = [
            INJECT.pair('xclsvip', '1', 'vipbox.tv')
            //INJECT.pair('CBS_ADV_SUBSES_VAL', '0', 'cbs.com'),
            //INJECT.pair('CBS_ADV_VAL', '%25%3Bbc%3Dfalse', 'cbs.com'),
        ],

        /*
         * Array of INJECT.value() objects which contain javascript
         * to be injected.
         */
        scripts = [
            INJECT.setTimeoutNameInhibitor(bannedTimeoutNames),
            INJECT.setTimeoutContentInhibitor(bannedTimeoutContents)
        ],

        injectInterval;

    /*
     * Injectors
     */
    function scriptInjector(inject) {
        var script = document.createElement('script');

        script.innerHTML = inject.toString();

        if ( ! document.head) {
            return false;
        } else {
            document.head.appendChild(script);
            return true;
        }
    }

    function windowPropertyInjector(inject) {
        return scriptInjector('Object.defineProperty(window, "' + inject.key + '", { value: '
            + inject.value + ', writable: false, configurable: false });');
    }

    function cookieInjector(inject) {
        COOKIES.set(inject.key, String(inject.value));

        return COOKIES.get(inject.key) === String(inject.value);
    }

    /*
     * Run injections
     */
    function runInjection(injector, toInject) {
        // run injection for each element in list
        toInject.forEach(function (element, index) {

            if ( ! element || ! element.attempts || ! element.domainCheck || injector(element)) {
                // if current element doesn't have to be injected,
                // was successfully injected,
                // or attemps number is 0
                // we can remove it from the list
                toInject.splice(index, 1);
            }

            element.attempts -= 1;
        });
    }

    injectInterval = setInterval(function () {
        // inject all scripts
        runInjection(scriptInjector, scripts);

        // inject all window properties
        runInjection(windowPropertyInjector, windowProperties);

        // inject all cookies
        runInjection(cookieInjector, cookies);

        if (scripts.length + windowProperties.length + cookies.length == 0) {
            clearInterval(injectInterval);
        }
    }, 10);
})(document);
