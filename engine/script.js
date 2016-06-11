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

var SCRIPT = (function () {
    'use strict';

    var _SCRIPT = SCRIPT || {};

    _SCRIPT.create = function () {
        var self = {
            assignments: [],
            functions: [],
            statements: []
        };

        self.pushAssignment = function (name, expression) {
            self.assignments.push(name + ' = ' + expression);

            return self;
        };

        self.pushFunction = function (fn) {
            self.functions.push(fn.toString() + '\r\n');

            return self;
        };

        self.pushSelfInvoking = function (fn) {
            self.statements.push('(' + fn.toString() + ')();\r\n');

            return self;
        };

        self.render = function () {
            var newLine = '\r\n',
                indent = newLine + '\t';

            return '(function () {"use strict";' + newLine
                + 'var ' + self.assignments.join(',' + indent) + ';' + newLine
                + indent + self.functions.join(indent)
                + indent + self.statements.join(indent)
                + newLine + '})();';
        };

        return self;
    };

    return _SCRIPT;
})();
