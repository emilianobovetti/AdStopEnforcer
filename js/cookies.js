var COOKIES = (function (document) {
    'use strict';
    var _COOKIES = COOKIES || {},

        __read_cookies = function () {
            var cookies = {};

            document.cookie.split('; ').forEach(function (item) {
                if ( ! item) return;

                item = item.split('=');
                cookies[item[0]] = item[1];
            });

            return cookies;
        };

    _COOKIES.get = function (key) {
        return __read_cookies()[key];
    };

    _COOKIES.set = function (key, value) {
        if ( ! key) return;

        document.cookie = key + '=' + value + ';';
    };

    _COOKIES.remove = function (key) {
        document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    };

    return _COOKIES;
})(document);
