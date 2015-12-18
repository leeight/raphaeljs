/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @file src/raphael.ext.js
 * @author leeight
 */

define(function (require) {
    var exports = {};

    exports.init = function (Raphael) {
        Raphael.el.cross = function () {
            if (this.type !== 'circle') {
                return;
            }
            // this.attr({fill: 'red'});

            var cx = this.attr('cx');
            var cy = this.attr('cy');
            var r  = this.attr('r');

            var path = [
                ['M', cx - r, cy - r],
                ['L', cx + r, cy + r],
                ['M', cx + r, cy - r],
                ['L', cx - r, cy + r]
            ];
            this.attr({cursor: 'pointer'});
            this.paper.path(path).attr({
                'stroke': 'red',
                'cursor': 'pointer',
                'stroke-width': 2,
                'clip-rect': (cx - r / 2) + ',' + (cy - r / 2) + ',' + r + ',' + r
            });
        };
    };

    return exports;
});











/* vim: set ts=4 sw=4 sts=4 tw=120: */
