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
    document, setInterval, clearInterval, INJECT
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
            INJECT.pair('onAdBlockStart', INJECT.emptyFunction),
            INJECT.pair('is_adblock_detect', 'false'),
            INJECT.pair('adbActive', 'false'),

            INJECT.pair('tmgAds.adblock.status', '1', 'telegraph.co.uk'),
            INJECT.pair('fbs_settings.classes', '"WyJhIiwiYiJd"', 'forbes.com'),
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
        bannedSetTimeoutNames = [
            INJECT.value('adsBlock', 'el-nation.com')
        ],

        /*
         * Values in this array cannot appear in code of functions that
         * are passed to setTimeout().
         *
         * This can be CPU intensive.
         */
        bannedSetTimeoutContents = [
            INJECT.value('displayAdBlockMessage', 'forbes.com'),
            INJECT.value('adsbygoogle', 'theplace2.ru')
        ],

        /*
         * Array of INJECT.pair() objects with filtered jQuery selector
         * and an object of injected properties.
         */
        filteredJQuerySelectors = [
            INJECT.pair('#vipchat', '{ length: 1 }', ['vipbox.tv', 'vipbox.sx'])
        ],

        /*
         * Array of strings which contain javascript
         * to be injected.
         */
        scripts = [
            INJECT.setTimeoutNameInhibitor(bannedSetTimeoutNames),
            INJECT.setTimeoutContentInhibitor(bannedSetTimeoutContents),
            INJECT.jQuerySelectorFilter(filteredJQuerySelectors)
        ],

        injectInterval;

    /*
     * Injectors
     */
    function scriptInjector(inject) {
        var s = document.createElement('script');

        inject = typeof inject == 'string' ? inject : inject.value;

        if (inject) {
            s.textContent = inject;

            (document.head || document.documentElement).appendChild(s);
            s.remove();
        }

        return true;
    }

    function windowPropertyInjector(property) {
        return scriptInjector(INJECT.windowProperty(property));
    }

    /*
     * Run injections
     */
    function runInjection(injector, itemsToInject) {
        // run injection for each item in list
        itemsToInject.forEach(function (item, index) {
            // do we have to inject current item?
            var injectItem = item && ((item.attempts && item.domainCheck) || typeof item == 'string');

            if (injectItem && ! injector(item)) {
                // if current item had to be injected,
                // but injector wasn't able to inject
                // then decrement attempts
                item.attempts -= 1;
            } else {
                // if current item doesn't have to be injected,
                // or it was successfully injected,
                // we can remove it from the list
                itemsToInject.splice(index, 1);
            }
        });
    }

    injectInterval = setInterval(function () {
        // inject all scripts
        runInjection(scriptInjector, scripts);

        // inject all window properties
        runInjection(windowPropertyInjector, windowProperties);

        if (scripts.length + windowProperties.length == 0) {
            clearInterval(injectInterval);
        }
    }, 10);
})(document);
