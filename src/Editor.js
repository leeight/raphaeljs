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
    var ContextMenu = require('./ContextMenu');

    /**
     * @constructor
     * @param {Element} canvas The svg element.
     * @param {Paper} paper The raphael paper.
     */
    function Editor(canvas, paper) {
        this.canvas = canvas;
        this.clientRect = canvas.getBoundingClientRect();
        this.paper = paper;

        this.menu = new ContextMenu();


        this._startNode = null;
        this._endNode = null;
        this._line = null;
        this._edges = [];
    }

    Editor.prototype.init = function () {
        this.bindEvent();
    };

    Editor.prototype.bindEvent = function () {
        this.canvas.onmousedown   = this._onMouseDown.bind(this);
        this.canvas.onmousemove   = this._onMouseMove.bind(this);
        this.canvas.onmouseover   = this._onMouseOver.bind(this);
        this.canvas.onmouseup     = this._onMoseUp.bind(this);
        this.canvas.oncontextmenu = this._onContextMenu.bind(this);
        this.canvas.onclick       = this._onClick.bind(this);
    };

    Editor.prototype._onClick = function (e) {
        this.menu.hide();
    };

    /**
     * 右键点击 Edge 的时候，显示自定义的菜单
     * @param {jQuery.Event} e Event object.
     */
    Editor.prototype._onContextMenu = function (e) {
        var target = e.target;
        if (target.nodeName === 'path') {
            this.menu.setItems(['Delete']);
        }
        else if (target.nodeName === 'rect') {
            this.menu.setItems(['Delete', 'Copy', '--', 'Help']);
        }
        else {
            this.menu.hide();
            return;
        }

        var x = (e.clientX - this.clientRect.left);
        var y = (e.clientY - this.clientRect.top);
        this.menu.show().moveTo(e.pageX + 5, e.pageY + 5);
        e.preventDefault();
    };

    Editor.prototype._onMouseDown = function (e) {
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

    Editor.prototype._onMouseOver = function (e) {
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

    Editor.prototype._onMouseMove = function (e) {
        if (!this._line) {
            return;
        }

        var start = this._line.start;
        var offsetX = (e.clientX - this.clientRect.left);
        var offsetY = (e.clientY - this.clientRect.top);
        var path = [start, ['L', offsetX, offsetY]];
        this._line.attr('path', path);
    };

    Editor.prototype._onMoseUp = function (e) {
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
        var edge = new Edge(n1, n2, this._line);
        this._edges.push(edge);

        this._line = null;
        this._endNode = null;
        this._startNode = null;
    };

    return Editor;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
