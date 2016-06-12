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

chrome.runtime.sendMessage({ storage: 'mode' }, function (response) {
    'use strict';

    var inject = INJECT.create();

    inject.mode = response.storage || 'normal';

    // log debug info
    inject.debug = false;

    if (inject.mode === 'off') {
        return;
    }

    /*
     * Variabile names and values to be injected.
     * They can't be overridden.
     */
    inject.normal.windowProperties = [
        INJECT.pair('fuckAdBlock', INJECT.fakeFab),
        INJECT.pair('blockAdBlock', INJECT.fakeFab),
        INJECT.pair('sniffAdBlock', INJECT.fakeFab),
        INJECT.pair('cadetect', INJECT.fakeFab),
        INJECT.pair('FuckAdBlock', INJECT.fakeFabConstructor),
        INJECT.pair('BlockAdBlock', INJECT.fakeFabConstructor),
        INJECT.pair('onAdBlockStart', INJECT.emptyFunction),
        INJECT.pair('is_adblock_detect', false),
        INJECT.pair('adbActive', false),
        INJECT.pair('google_ad_client', 'pub'), // antiblock.org

        INJECT.pair('tmgAds.adblock.status', 1, 'telegraph.co.uk'),
        INJECT.pair('fbs_settings.classes', 'WyJhIiwiYiJd', 'forbes.com'),
        INJECT.pair('CWTVIsAdBlocking', INJECT.emptyFunction, 'cwtv.com'), // TODO
        INJECT.pair('xaZlE', INJECT.emptyFunction, 'kisscartoon.me')
    ];

    /*
     * Bait classes.
     * If one of these classes are passed to Element.prototype.setAttribute,
     * the element class is not setted.
     */
    inject.normal.baitClasses = [
        'pub_300x250',
        'pub_300x250m',
        'pub_728x90',
        'text-ad',
        'textAd',
        'text_ad',
        'text_ads',
        'text-ads',
        'text-ad-links'
    ];

    /*
     * Function names that can't be called through setTimeout().
     */
    inject.normal.bannedSetTimeoutNames = [
        INJECT.value('adsBlock', 'el-nation.com')
    ];

    /*
     * Values in this array cannot appear in code of functions that
     * are passed to setTimeout().
     */
    inject.normal.bannedSetTimeoutContents = [
        INJECT.value('displayAdBlockMessage', 'forbes.com'),
        INJECT.value('adsbygoogle', 'theplace2.ru')
    ];

    /*
     * Filtered jQuery selector and an object of injected properties.
     */
    inject.normal.jQuerySelectors = [
        INJECT.pair('#vipchat', { length: 1 }, ['vipbox.tv', 'vipbox.sx'])
    ];

    /*
     * Experimental only
     */
    inject.experimental.idBlacklist = [
        'ad',
        'Ad',
        'AD',
        'bnr-',
        'paid',
        'sponsor',
        'annonse',
        'sky-left',
        'upperMpu',
        'openx-slc',
        'bannerid',
        'glinkswrapper'
    ];

    inject.experimental.idWhitelist = [
        'add',
        'admin',
        'Admin',
        'ADMIN',
        'load',
        // facebook whitelist
        'pagelet_advertiser_panel',
        'pagelet_above_header_timeline',
        'hyperfeed_story_id'
    ];

    inject.experimental.domainBlacklist = [
        'agoda.net',
        'ad.mail.ru',
        's0.2mdn.net',
        'adn.ebay.com',
        'juicyads.com',
        'as.inbox.com',
        'b.ifmnwi.club',
        'antiblock.org',
        'ads.yahoo.com',
        'ads.zynga.com',
        'ads.twitter.com',
        'promote.pair.com',
        'ad.foxnetworks.com',
        'a.livesportmedia.eu',
        'advertising.aol.com',
        'cas.clickability.com',
        'www.paypalobjects.com',
        'advertising.yahoo.com',
        'native.sharethrough.com',
        'pubads.g.doubleclick.net',
        'adsatt.espn.starwave.com',
        'partnerads.ysm.yahoo.com',
        'adsatt.abcnews.starwave.com',
        'www.doubleclickbygoogle.com',
        'pagead2.googlesyndication.com'
    ];

    inject.run();
});
