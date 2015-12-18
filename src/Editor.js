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
 * @file src/Editor.js
 * @author leeight
 */

define(function (require) {

    var util = require('./util');
    var Edge = require('./Edge');
    var Node = require('./Node');
    var ContextMenu = require('./ContextMenu');

    /**
     * 编辑器
     *
     * @constructor
     * @param {Raphael.Paper} paper The raphael paper.
     */
    function Editor(paper) {
        this.paper = paper;
        this.clientRect = paper.canvas.getBoundingClientRect();

        this.menu = new ContextMenu();


        /**
         * 划线时候的开始节点
         * @type {Raphael.Circle}
         */
        this._startNode = null;

        /**
         * 划线时候的结束节点
         * @type {Raphael.Circle}
         */
        this._endNode = null;

        /**
         * 拖动过程中的那条虚线
         * @type {Raphael.Path}
         */
        this._line = null;

        /**
         * 所有的边
         * @type {Array.<Edge>}
         */
        this._edges = [];

        /**
         * 所有的节点
         * @type {Array.<Node>}
         */
        this._nodes = [];
    }

    Editor.prototype.init = function () {
        this.bindEvent();
    };

    Editor.prototype.bindEvent = function () {
        var canvas = this.paper.canvas;
        canvas.onmousedown   = this._onMouseDown.bind(this);
        canvas.onmousemove   = this._onMouseMove.bind(this);
        canvas.onmouseover   = this._onMouseOver.bind(this);
        canvas.onmouseup     = this._onMoseUp.bind(this);
        canvas.oncontextmenu = this._onContextMenu.bind(this);
        canvas.onclick       = this._onClick.bind(this);
        this.menu.onselected = this._onContextMenuSelected.bind(this);
    };

    Editor.prototype._onClick = function (e) {
        this.menu.hide();
    };

    Editor.prototype._onContextMenuSelected = function (e) {
        if (e.type === 'Delete Path') {
            var edge = e.target;    // Node | Edge
            if (edge) {
                edge.remove();
                console.log(edge);
            }
        }
        else if (e.type === 'Delete Rect') {
            var node = e.target;
            if (node) {
                node.remove();
                console.log(node);
            }
        }
    };

    Editor.prototype.addNode = function (node) {
        this._nodes.push(node);
    };

    Editor.prototype.generateNode = function () {
        var width = util.pick(150, 250);
        var height = util.pick(30, 60);
        var node = new Node(this.paper, {
            x: util.pick(0, 640 - width),
            y: util.pick(0, 480 - height),
            width: width,
            height: height,
            input: util.pick(0, 3),
            output: util.pick(1, 4)
        });
        node.moveable();

        this.addNode(node);
    };

    /**
     * 右键点击 Edge 的时候，显示自定义的菜单
     *
     * @param {jQuery.Event} e Event object.
     */
    Editor.prototype._onContextMenu = function (e) {
        // target 是 DOM element
        // target.raphaelid -> Raphael.Element
        // Raphael.Element.__sId -> Node | Edge
        var target = e.target;
        var raphaelElement;
        if (target.nodeName === 'path') {
            raphaelElement = this.paper.getById(target.raphaelid);
            this.menu.setTarget(util.getInstance(raphaelElement.__sId));
            this.menu.setItems(['Delete Path']);
        }
        else if (target.nodeName === 'rect') {
            raphaelElement = this.paper.getById(target.raphaelid);
            this.menu.setTarget(util.getInstance(raphaelElement.__sId));
            this.menu.setItems(['Delete Rect', 'Copy Rect', '--', 'Help']);
        }
        else {
            this.menu.hide();
            return;
        }

        // var x = (e.clientX - this.clientRect.left);
        // var y = (e.clientY - this.clientRect.top);
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

        var startCircle = this._startNode;
        var endCircle = this._endNode;
        var edge = new Edge(startCircle, endCircle, this._line);
        this._edges.push(edge);

        this._line = null;
        this._endNode = null;
        this._startNode = null;
    };

    return Editor;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
