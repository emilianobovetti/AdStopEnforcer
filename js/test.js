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

    var inject = INJECT.create();

    console.log('\t/////////////////////\r\n',
                '\t// FuckFuckAdBlock //\r\n',
                '\t/////////////////////\r\n');

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

    /*
     * Functions
     */
    inject.script.pushFunction(function assertEquals (expected, actual) {
        if (expected !== actual) {
            throw new Error('Expected '
                + JSON.stringify(expected)
                + ', found '
                + JSON.stringify(actual)
                + '\r\n' + assertEquals.caller);
        }
    });

    /*
     * Test window property injection
     */
    inject.script.pushSelfInvoking(function testNullImmutable () {
        testNull = {};

        assertEquals(null, testNull);
    });

    inject.script.pushSelfInvoking(function testUndefinedImmutable () {
        testUndefined = {};

        assertEquals(undefined, testUndefined);
    });

    inject.script.pushSelfInvoking(function testTrueImmutable () {
        testTrue = {};

        assertEquals(true, testTrue);
    });

    inject.script.pushSelfInvoking(function testFalseImmutable () {
        testFalse = {};

        assertEquals(false, testFalse);
    });

    inject.script.pushSelfInvoking(function testNumberOneImmutable () {
        testNumberOne = {};

        assertEquals(1, testNumberOne);
    });

    inject.script.pushSelfInvoking(function testStringImmutable () {
        testString = {};

        assertEquals('string', testString);
    });

    inject.script.pushSelfInvoking(function testEmptyFunctionImmutable () {
        testEmptyFunction = {};

        assertEquals('function () {}', testEmptyFunction.toString());
    });

    inject.script.pushSelfInvoking(function testEmptyObjectImmutable () {
        testEmptyObject = null;

        assertEquals('{}', JSON.stringify(testEmptyObject));
    });

    inject.script.pushSelfInvoking(function testNestedPropertyImmutable () {
        test = {};
        test.nested = {};
        test.nested.property = {};

        assertEquals(null, test.nested.property);

        test = undefined;

        test = { nested: { property: 1 } };

        assertEquals(null, test.nested.property);
    });

    /*
     * Test setTimeout injection
     */
    inject.script.pushSelfInvoking(function testSetTimeoutBannedName () {
        setTimeout(function setTimeoutBannedName() {
            throw new Error('Able to call banned setTimeout name');
        }, 1);
    });

    inject.script.pushSelfInvoking(function testSetTimeoutAllowedName () {
        var called = false;

        setTimeout(function setTimeoutAllowedName() {
            called = true;
        }, 1);

        setTimeout(function () {
            if ( ! called) {
                throw new Error('Unable to call allowed setTimeout name');
            }
        }, 2);
    });

    inject.script.pushSelfInvoking(function testSetTimeoutBannedContent () {
        setTimeout(function () {
            var setTimeoutBannedContent;

            throw new Error('Able to call function with setTimeout banned content');
        }, 1);
    });

    /*
     * Test jQuery injection
     */
    inject.script.pushSelfInvoking(function testJQuerySelectors () {
        window.onload = function () {
            if (typeof $ !== undefined) {
                assertEquals(1, $('#testIdSelector').length);
            } else {
                console.log('jQuery not loaded');
            }
        }
    });

    //inject.debug = true;

    inject.run();

})();
