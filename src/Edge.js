/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

define(function (require) {

    var util = require('./util');

    /**
     * 两个 Node 之间的『边』，不是 circle 直接的连线.
     *
     * @constructor
     * @param {number} n1 Node1
     * @param {number} n2 Node2
     * @param {Raphael.Path} line The line.
     */
    function Edge(n1, n2, line) {
        this.n1 = n1;
        this.n2 = n2;
        this.line = line;
        this.close = null;

        this.n1.addOutEdge(this);
        this.n2.addInEdge(this);

        this.bindEvent();
    }

    Edge.prototype.bindEvent = function () {
        this.line.click(this._clickPath.bind(this));
    };

    Edge.prototype._clickPath = function (e) {
        this.line.attr({'stroke-dasharray': '-.'});

        // FIXME clientRect
        var svg = document.querySelector('#holder > svg');
        var clientRect = svg.getBoundingClientRect();
        var offsetX = (e.clientX - clientRect.left);
        var offsetY = (e.clientY - clientRect.top);
        if (!this.close) {
            this.close = this.line.paper.circle(offsetX, offsetY, 10);
            this.close.cross();
            this.close.attr({fill: '#cfcfcf'});
        }
        this.close.attr({cx: offsetX, cy: offsetY});
    };

    Edge.prototype.onStart = function () {
        this.line.__path = this.line.attr('path');
    };

    Edge.prototype.onMoveEndPoint = function (dx, dy) {
        var savedPath = this.line.__path;
        var start = savedPath[0];
        var end = savedPath[1];
        var path = util.path2curve(start[1], start[2], end[5] + dx, end[6] + dy);
        this.line.attr('path', path);
    };

    Edge.prototype.onMoveStartPoint = function (dx, dy) {
        var savedPath = this.line.__path;
        var start = savedPath[0];
        var end = savedPath[1];
        var path = util.path2curve(start[1] + dx, start[2] + dy, end[5], end[6]);
        this.line.attr('path', path);
    };

    return Edge;

});











/* vim: set ts=4 sw=4 sts=4 tw=120: */
