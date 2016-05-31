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
    document, setTimeout, INJECT
 */
(function (document) {
    'use strict';

    var inject = INJECT.create();

    inject.windowProperties([
        INJECT.pair('testNull', null),
        INJECT.pair('testUndefined', undefined),
        INJECT.pair('testTrue', true),
        INJECT.pair('testFalse', false),
        INJECT.pair('testNumberOne', 1),
        INJECT.pair('testString', 'string'),
        INJECT.pair('testEmptyFunction', function () {}),
        INJECT.pair('testEmptyObject', {}),
        INJECT.pair('test.nested.property', null)
    ]);

    inject.bannedSetTimeoutNames([
        INJECT.value('setTimeoutBannedName')
    ]);

    inject.bannedSetTimeoutContents([
        INJECT.value('setTimeoutBannedContent')
    ]);

    inject.jQuerySelectors([
        INJECT.pair('#testIdSelector', { length: 1 })
    ]);

    function assertEquals(expected, actual) {
        if (expected !== actual) {
            throw new Error('Expected '
                + JSON.stringify(expected)
                + ', found '
                + JSON.stringify(actual)
                + '\r\n' + assertEquals.caller);
        }
    }

    function testNullImmutable() {
        testNull = {};

        assertEquals(null, testNull);
    }

    function testUndefinedImmutable() {
        testUndefined = {};

        assertEquals(undefined, testUndefined);
    }

    function testTrueImmutable() {
        testTrue = {};

        assertEquals(true, testTrue);
    }

    function testFalseImmutable() {
        testFalse = {};

        assertEquals(false, testFalse);
    }

    function testNumberOneImmutable() {
        testNumberOne = {};

        assertEquals(1, testNumberOne);
    }

    function testStringImmutable() {
        testString = {};

        assertEquals('string', testString);
    }

    function testEmptyFunctionImmutable() {
        testEmptyFunction = {};

        assertEquals('function () {}', testEmptyFunction.toString());
    }

    function testEmptyObjectImmutable() {
        testEmptyObject = null;

        assertEquals('{}', JSON.stringify(testEmptyObject));
    }

    function testNestedPropertyImmutable() {
        test = {};
        test.nested = {};
        test.nested.property = {};

        assertEquals(null, test.nested.property);

        test = undefined;

        test = { nested: { property: 1 } };

        assertEquals(null, test.nested.property);
    }

    function testSetTimeoutBannedName () {
        setTimeout(function setTimeoutBannedName() {
            throw new Error('Able to call banned setTimeout name');
        }, 1);
    }

    function testSetTimeoutAllowedName () {
        var called = false;

        setTimeout(function setTimeoutAllowedName() {
            called = true;
        }, 1);

        setTimeout(function () {
            if ( ! called) {
                throw new Error('Unable to call allowed setTimeout name');
            }
        }, 2);
    }

    function testSetTimeoutBannedContent () {
        setTimeout(function () {
            var setTimeoutBannedContent;

            throw new Error('Able to call function with setTimeout banned content');
        }, 1);
    }

    function testJQuerySelectors () {
        window.onload = function () {
            if (typeof $ !== undefined) {
                assertEquals(1, $('#testIdSelector').length);
            } else {
                console.log('jQuery not loaded');
            }
        }
    }

    setTimeout(function () {
        var scriptElement = document.createElement('script'),
            script = inject.script;

        script.pushFunction(assertEquals);

        script.pushSelfInvoking(testNullImmutable);
        script.pushSelfInvoking(testUndefinedImmutable);
        script.pushSelfInvoking(testTrueImmutable);
        script.pushSelfInvoking(testFalseImmutable);
        script.pushSelfInvoking(testNumberOneImmutable);
        script.pushSelfInvoking(testStringImmutable);
        script.pushSelfInvoking(testEmptyFunctionImmutable);
        script.pushSelfInvoking(testEmptyObjectImmutable);
        script.pushSelfInvoking(testNestedPropertyImmutable);

        script.pushSelfInvoking(testSetTimeoutBannedName);
        script.pushSelfInvoking(testSetTimeoutAllowedName);
        script.pushSelfInvoking(testSetTimeoutBannedContent);

        script.pushSelfInvoking(testJQuerySelectors);

        scriptElement.textContent = script.render();

        (document.head || document.documentElement).appendChild(scriptElement);
        scriptElement.remove();
    }, 10);
})(document);
