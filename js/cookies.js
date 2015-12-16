var COOKIES = (function (document) {
    'use strict';
    var _COOKIES = COOKIES || {},
        __cache = {};

    document.cookie.split('; ').forEach(function (item) {
        if ( ! item) return;

        item = item.split('=');
        __cache[item[0]] = item[1];
    });

    _COOKIES.get = function (key) {
        return __cache[key];
    };

    _COOKIES.set = function (key, value) {
        if ( ! key) return;

        __cache[key] = value;

        document.cookie = key + '=' + value + ';';
    };

    _COOKIES.remove = function (key) {
        delete __cache[key];

        document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    };

    return _COOKIES;
})(document);
