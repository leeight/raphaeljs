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
     * @param {Raphael.Circle} startCircle The start circle.
     * @param {Raphael.Circle} endCircle The end circle.
     * @param {Raphael.Path} line The line.
     */
    function Edge(startCircle, endCircle, line) {
        util.Base.call(this);

        this.line = line;
        this.line.__sId = this._id;

        this.startCircle = startCircle;
        this.endCircle = endCircle;

        this.endCircle.attr({opacity: 0});
        this.startCircle.attr({fill: 'black'});

        this.start = util.getInstance(startCircle.__sId);
        this.end = util.getInstance(endCircle.__sId);

        this.start.addOutEdge(this);
        this.end.addInEdge(this);

        this.bindEvent();
    }

    Edge.prototype.remove = function () {
        this.start.removeOutEdge(this);
        this.end.removeInEdge(this);

        this.startCircle.attr({fill: 'white'});
        this.endCircle.attr({opacity: 1});
        this.line.remove();
    };

    Edge.prototype.bindEvent = function () {
        this.line.click(this._clickPath.bind(this));
        var glow = null;
        this.line.mouseover(function () {
            glow = this.glow();
        });
        this.line.mouseout(function () {
            if (glow) {
                glow.remove();
            }
        });
    };

    Edge.prototype._clickPath = function (e) {
        this.line.attr({'stroke-dasharray': '-.'});
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
