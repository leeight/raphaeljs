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
 * @file src/Node.js
 * @author leeight
 */

define(function (require) {

    var util = require('./util');

    /**
     * Node的构造函数
     *
     * @constructor
     * @param {Raphael.Paper} paper 画布.
     * @param {Object} config Node's configuration.
     */
    function Node(paper, config) {
        util.Base.call(this);

        this.paper = paper;
        this.rect = paper.rect(config.x, config.y,
            config.width, config.height, config.radius || 5);
        this.rect.__sId = this._id;

        this.circles = this._initInputAndOutput(config);

        this.icon = this._getIcon(config);
        this.text = this._getText(config);

        /**
         * 入边，移动的时候，调整 Mx,y 的值
         * @type {Array.<paths>}
         */
        this.inEdges = [];

        /**
         * 出边，移动的时候，调整 Lx,y 的值
         * @type {Array.<paths>}
         */
        this.outEdges = [];

        var color = Raphael.getColor();
        this.group = paper.set();
        this.group.push.apply(this.group, this.circles);
        this.group.attr({fill: '#fff', stroke: '#fff', cursor: 'pointer'});

        this.rect.attr({fill: color, cursor: 'move', stroke: '#cfcfcf'});
    }

    Node.prototype.remove = function () {
        util.remove(this.outEdges, this.inEdges,
            this.circles, this.rect, this.icon, this.text);
    };

    Node.prototype.removeOutEdge = function (edge) {
        for (var i = 0; i < this.outEdges.length; i++) {
            if (edge === this.outEdges[i]) {
                this.outEdges.splice(i, 1);
                break;
            }
        }
    };

    Node.prototype.removeInEdge = function (edge) {
        for (var i = 0; i < this.inEdges.length; i++) {
            if (edge === this.inEdges[i]) {
                this.inEdges.splice(i, 1);
                break;
            }
        }
    };

    Node.prototype.addOutEdge = function (edge) {
        this.outEdges.push(edge);
    };

    Node.prototype.addInEdge = function (edge) {
        this.inEdges.push(edge);
    };

    Node.prototype._getText = function (config) {
        if (config.text) {
            var x = config.x + config.width / 2;
            var y = config.y + config.height / 2;
            var text = this.paper.text(x, y, config.text);
            text.attr({
                'font-size': 24,
                'font-family': 'Arial, sans-serif',
                'fill': '#fff'
            });
            return text;
        }
    };

    Node.prototype._getIcon = function (config) {
        var icon = config.icon;
        if (/^fa:\/\//.test(icon)) {
            var b1 = this.rect.getBBox();
            var size = b1.height - 10;
            var text = this.paper.text(0, 0, icon.substr(5));
            text.attr({
                'font-size': size,
                'fill': '#fff',
                'font-family': 'FontAwesome'
            });
            var b2 = text.getBBox();
            text.attr({
                x: b1.x + 10 + (b2.width / 2),
                // 10 的话貌似不是居中对齐的.
                y: b1.y + 4 + (b2.height / 2)
            });
            return text;
        }
        return null;
    };

    Node.prototype._initInputAndOutput = function (config) {
        function enlargeCircle(e) {
            this.attr({fill: 'yellow', r: 8});
        }

        function restoreCircleSize(e) {
            this.attr({fill: 'white', r: 5});
        }

        var circles = [];
        if (config.input) {
            var step = (config.width / (config.input + 1));
            for (var i = 0; i < config.input; i++) {
                var x = config.x + (i + 1) * step;
                var y = config.y;
                var circle = this.paper.circle(x, y, 5);
                circle.mouseover(enlargeCircle);
                circle.mouseout(restoreCircleSize);
                circle.__sId = this._id;
                circles.push(circle);
            }
        }

        if (config.output) {
            step = (config.width / (config.output + 1));
            for (i = 0; i < config.output; i++) {
                x = config.x + (i + 1) * step;
                y = config.y + config.height;
                circle = this.paper.circle(x, y, 5);
                circle.mouseover(enlargeCircle);
                circle.mouseout(restoreCircleSize);
                circle.__sId = this._id;
                circles.push(circle);
            }
        }

        return circles;
    };

    Node.prototype.moveable = function () {
        this.rect.drag(
            this.onMove,
            this.onStart,
            this.onEnd,
            this, this, this
        );
    };

    Node.prototype.onStart = function () {
        this.rect.ox = this.rect.attr('x');
        this.rect.oy = this.rect.attr('y');
        this.circles.forEach(function (circle) {
            circle.ox = circle.attr('cx');
            circle.oy = circle.attr('cy');
        });
        this.inEdges.forEach(function (edge) {
            edge.onStart();
        });
        this.outEdges.forEach(function (edge) {
            edge.onStart();
        });
        if (this.icon) {
            this.icon.ox = this.icon.attr('x');
            this.icon.oy = this.icon.attr('y');
        }
        if (this.text) {
            this.text.ox = this.text.attr('x');
            this.text.oy = this.text.attr('y');
        }

        this.rect.animate({'fill-opacity': .2}, 500);
        if (this.icon) {
            this.icon.animate({'fill-opacity': .2}, 500);
        }
        if (this.text) {
            this.text.animate({'fill-opacity': .2}, 500);
        }
    };

    Node.prototype.onMove = function (dx, dy) {
        this.rect.attr({
            x: this.rect.ox + dx,
            y: this.rect.oy + dy
        });
        this.circles.forEach(function (circle) {
            circle.attr({
                cx: circle.ox + dx,
                cy: circle.oy + dy
            });
        });
        this.inEdges.forEach(function (edge) {
            edge.onMoveEndPoint(dx, dy);
        });
        this.outEdges.forEach(function (edge) {
            edge.onMoveStartPoint(dx, dy);
        });
        if (this.icon) {
            this.icon.attr({
                x: this.icon.ox + dx,
                y: this.icon.oy + dy
            });
        }
        if (this.text) {
            this.text.attr({
                x: this.text.ox + dx,
                y: this.text.oy + dy
            });
        }
    };

    Node.prototype.onEnd = function () {
        this.rect.animate({'fill-opacity': 1}, 500);
        if (this.icon) {
            this.icon.animate({'fill-opacity': 1}, 500);
        }
        if (this.text) {
            this.text.animate({'fill-opacity': 1}, 500);
        }
    };

    return Node;

});











/* vim: set ts=4 sw=4 sts=4 tw=120: */
