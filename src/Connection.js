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
 */

define(function (require) {

    var util = require('./util');
    var Edge = require('./Edge');

    /**
     * @constructor
     * @param {Element} canvas The svg element.
     * @param {Paper} paper The raphael paper.
     */
    function Connection(canvas, paper) {
        this.canvas = canvas;
        this.clientRect = canvas.getBoundingClientRect();
        this.paper = paper;

        this._startNode = null;
        this._endNode = null;
        this._line = null;
        this._edges = [];
    }

    Connection.prototype.init = function () {
        this.bindEvent();
    };

    Connection.prototype.bindEvent = function () {
        this.canvas.onmousedown = this._onMouseDown.bind(this);
        this.canvas.onmousemove = this._onMouseMove.bind(this);
        this.canvas.onmouseover = this._onMouseOver.bind(this);
        this.canvas.onmouseup   = this._onMoseUp.bind(this);
    };

    Connection.prototype._onMouseDown = function (e) {
        var target = e.target;
        if (target.nodeName !== 'circle'
            || !target.raphael) {
            return;
        }

        this._startNode = this.paper.getById(target.raphaelid);

        var x = this._startNode.attr('cx');
        var y = this._startNode.attr('cy');
        var start = ['M', x, y];
        var path = [start, ['L', (x + 1), (y + 1)]];
        this._line = this.paper.path(path);
        this._line.attr({'stroke-width': 2, 'stroke': '#cfcfcf',
            'arrow-end': 'diamond-wide', 'stroke-dasharray': '-.',
            'cursor': 'pointer'});
        this._line.start = start;
    };

    Connection.prototype._onMouseOver = function (e) {
        var target = e.target;
        if (target.nodeName !== 'circle'
            || !target.raphael
            || !this._startNode) {
            return;
        }

        if (this._endNode && this._endNode.id === target.raphaelid) {
            return;
        }

        var node = this.paper.getById(target.raphaelid);
        if (this._startNode !== node) {
            this._endNode = node;
        }
    };

    Connection.prototype._onMouseMove = function (e) {
        if (!this._line) {
            return;
        }

        var start = this._line.start;
        var offsetX = (e.clientX - this.clientRect.left);
        var offsetY = (e.clientY - this.clientRect.top);
        var path = [start, ['L', offsetX, offsetY]];
        this._line.attr('path', path);
    };

    Connection.prototype._onMoseUp = function (e) {
        if (!this._endNode) {
            if (this._line) {
                this._line.remove();
                this._line = null;
                this._startNode = null;
            }
            return;
        }

        if (!this._line) {
            return;
        }

        var start = this._line.start;
        var x = this._endNode.attr('cx');
        var y = this._endNode.attr('cy');
        var path = util.path2curve(start[1], start[2], x, y);
        this._line.attr({'path': path, 'stroke-dasharray': 'none'});
        this._endNode.attr({opacity: 0});
        this._startNode.attr({fill: 'black'});

        var n1 = this._startNode.refNode;
        var n2 = this._endNode.refNode;
        this._edges.push(new Edge(n1, n2, this._line));

        this._line = null;
        this._endNode = null;
        this._startNode = null;
    };

    return Connection;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
