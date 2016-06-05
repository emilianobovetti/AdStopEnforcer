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
    console, INJECT
 */
(function () {
    'use strict';

    var inject = INJECT.create();

    console.log('\t////////////////////////////////\r\n',
                '\t// FuckFuckAdBlock test suite //\r\n',
                '\t////////////////////////////////\r\n');

    inject.debug = false;

    inject.setWindowProperties([
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

    inject.setBaitClasses([
        INJECT.value('testBaitClass1'),
        INJECT.value('testBaitClass2')
    ]);

    inject.setBannedSetTimeoutNames([
        INJECT.value('setTimeoutBannedName')
    ]);

    inject.setBannedSetTimeoutContents([
        INJECT.value('setTimeoutBannedContent')
    ]);

    inject.setJQuerySelectors([
        INJECT.pair('#testIdSelector', { length: 1 })
    ]);

    /*
     * Functions
     */
    inject.script.pushFunction(function assertEquals (expected, actual) {
        var callerName;

        if (expected === actual) {
            return;
        }

        try {
            throw new Error();
        } catch (e) {
            callerName = e.stack.split('at')[2].trim();
        }

        throw new Error('Expected '
            + JSON.stringify(expected)
            + ', found '
            + JSON.stringify(actual)
            + ' in ' + callerName);
    });

    /*
     * Test window property injection
     */
    inject.script.pushSelfInvoking(function testDefined () {
        assertEquals(true, testTrue);
    });

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
     * Test bait classes injection
     */
    inject.script.pushSelfInvoking(function testBannedBaitClass () {
        var bait = document.createElement('div');

        bait.setAttribute('class', 'testBaitClass1');

        assertEquals(null, bait.getAttribute('class'));
    });

    inject.script.pushSelfInvoking(function testAllowedClass () {
        var bait = document.createElement('div');

        bait.setAttribute('class', 'allowed classes');

        assertEquals('allowed classes', bait.getAttribute('class'));
    });

    inject.script.pushSelfInvoking(function testMultipleBannedClasses () {
        var bait = document.createElement('div');

        bait.setAttribute('class', 'class1 class2 testBaitClass2 class3 class4');

        assertEquals(null, bait.getAttribute('class'));
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

    inject.run();

})();
