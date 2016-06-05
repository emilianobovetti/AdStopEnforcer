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
    INJECT
 */
(function () {
    'use strict';

    var inject = INJECT.create(),

        /* * * * * * * *
         * Normal mode *
         * * * * * * * */

        /*
         * Variabile names and values to be injected.
         * They can't be overridden.
         */
        windowProperties = [
            INJECT.pair('fuckAdBlock', INJECT.fakeFab),
            INJECT.pair('blockAdBlock', INJECT.fakeFab),
            INJECT.pair('sniffAdBlock', INJECT.fakeFab),
            INJECT.pair('cadetect', INJECT.fakeFab),
            INJECT.pair('FuckAdBlock', INJECT.fakeFabConstructor),
            INJECT.pair('BlockAdBlock', INJECT.fakeFabConstructor),
            INJECT.pair('onAdBlockStart', INJECT.emptyFunction),
            INJECT.pair('is_adblock_detect', false),
            INJECT.pair('adbActive', false),

            INJECT.pair('tmgAds.adblock.status', 1, 'telegraph.co.uk'),
            INJECT.pair('fbs_settings.classes', 'WyJhIiwiYiJd', 'forbes.com'),
            INJECT.pair('CWTVIsAdBlocking', INJECT.emptyFunction, 'cwtv.com'), // TODO
            INJECT.pair('xaZlE', INJECT.emptyFunction, 'kisscartoon.me')
        ],

        /*
         * Bait classes.
         * If one of these classes are passed to Element.prototype.setAttribute,
         * the element class is not setted.
         */
        baitClasses = [
            INJECT.value('pub_300x250'),
            INJECT.value('pub_300x250m'),
            INJECT.value('pub_728x90'),
            INJECT.value('text-ad'),
            INJECT.value('textAd'),
            INJECT.value('text_ad'),
            INJECT.value('text_ads'),
            INJECT.value('text-ads'),
            INJECT.value('text-ad-links')
        ],

        /*
         * Function names that can't be called through setTimeout().
         */
        bannedSetTimeoutNames = [
            INJECT.value('adsBlock', 'el-nation.com')
        ],

        /*
         * Values in this array cannot appear in code of functions that
         * are passed to setTimeout().
         */
        bannedSetTimeoutContents = [
            INJECT.value('displayAdBlockMessage', 'forbes.com'),
            INJECT.value('adsbygoogle', 'theplace2.ru')
        ],

        /*
         * Filtered jQuery selector and an object of injected properties.
         */
        jQuerySelectors = [
            INJECT.pair('#vipchat', { length: 1 }, ['vipbox.tv', 'vipbox.sx'])
        ],

        /* * * * * * * * * * *
         * Experimental mode *
         * * * * * * * * * * */

        /*
         * If one of these ids are passed to document.getElementById,
         * a fake element object is returned.
         */
        bannedElementIds = [
            INJECT.value('adSpace'),
            INJECT.value('adTop'),
            INJECT.value('ad_leader'),
            INJECT.value('adskintop'),
            INJECT.value('colRightAd'),
            INJECT.value('square_ad'),
            INJECT.value('walltopad'),
            INJECT.value('ad'),
            INJECT.value('ads'),
            INJECT.value('adsense')
        ];

    chrome.runtime.sendMessage({ storage: 'mode' }, function (response) {
        // TODO
        console.log((response.storage || 'normal') + ' mode');

        inject.debug = true;

        switch (response.storage || 'normal') {
            case 'experimental':
                inject.setBannedElementIds(bannedElementIds);
            case 'normal':
                inject.setWindowProperties(windowProperties);
                inject.setBaitClasses(baitClasses);
                inject.setBannedSetTimeoutNames(bannedSetTimeoutNames);
                inject.setBannedSetTimeoutContents(bannedSetTimeoutContents);
                inject.setJQuerySelectors(jQuerySelectors);

                inject.run();
            case 'off':
            default: break;
        }
    });

})();
