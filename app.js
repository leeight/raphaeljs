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

var paper = Raphael('holder', 640, 480);

/**
 * @constructor
 * @param {number} n1 Node1
 * @param {number} n2 Node2
 * @param {Raphael.Path} line The line.
 */
function Edge(n1, n2, line) {
    this.n1 = n1;
    this.n2 = n2;
    this.line = line;

    this.n1.addOutEdge(this);
    this.n2.addInEdge(this);
}

Edge.prototype.onStart = function () {
    this.line.__path = this.line.attr('path');
};

Edge.prototype.onMoveEndPoint = function (dx, dy) {
    var savedPath = this.line.__path;
    var start = savedPath[0];
    var end = savedPath[1];
    var path = start[0] + start[1] + ' ' + start[2]
               + end[0] + (end[1] + dx) + ' ' + (end[2] + dy);
    this.line.attr('path', path);
};

Edge.prototype.onMoveStartPoint = function (dx, dy) {
    var savedPath = this.line.__path;
    var start = savedPath[0];
    var end = savedPath[1];
    var path = start[0] + (start[1] + dx) + ' ' + (start[2] + dy)
               + end[0] + end[1] + ' ' + end[2];
    this.line.attr('path', path);
};

function Node(paper, config) {
    this.paper = paper;
    this.rect = paper.rect(config.x, config.y,
        config.width, config.height, config.radius || 5);
    this.circles = this._initInputAndOutput(config);

    /*
    if (config.text) {
        this.text = paper.text(config.x, config.y + config.height / 2,
            config.text);
    }
    */

    /**
     * 入边，移动的时候，调整 Mx,y 的值
     * @type {Array.<paths>}
     */
    this.inEdges = [];

    /**
     * 出变，移动的时候，调整 Lx,y 的值
     * @type {Array.<paths>}
     */
    this.outEdges = [];

    var color = Raphael.getColor();
    this.group = paper.set();
    this.group.push.apply(this.group, this.circles);
    this.group.attr({fill: '#fff', stroke: '#fff', cursor: 'pointer'});

    this.rect.attr({fill: color, cursor: 'move', stroke: '#cfcfcf'});
}

Node.prototype.addOutEdge = function (edge) {
    this.outEdges.push(edge);
};

Node.prototype.addInEdge = function (edge) {
    this.inEdges.push(edge);
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
        for (var i = 0; i < config.input; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y;
            var circle = this.paper.circle(x, y, 5);
            circle.toFront();
            circle.mouseover(enlargeCircle);
            circle.mouseout(restoreCircleSize);
            circle.refNode = this;
            circles.push(circle);
        }
    }

    if (config.output) {
        var step = (config.width / (config.output + 1));
        for (var i = 0; i < config.output; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y + config.height;
            var circle = this.paper.circle(x, y, 5);
            circle.toFront();
            circle.mouseover(enlargeCircle);
            circle.mouseout(restoreCircleSize);
            circle.refNode = this;
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
};

Node.prototype.onEnd = function () {
    console.log('DONE');
};

var node = new Node(paper, {
    x: 5, y: 5,
    width: 300, height: 50,
    text: 'hello world',
    icon: 'image://foo-bar',
    radius: 5,
    input: 1,
    output: 2
});
node.moveable();

var node2 = new Node(paper, {
    x: 100, y: 100,
    width: 100, height: 30,
    input: 1,
    output: 3
});
node2.moveable();

// 所有边的集合.
var g_edges = [];

// 鼠标点击下去时候的 circle
var g_startNode;  // circle

// 鼠标松开时候的 circle
var g_endNode;    // circle

// 需要画的线
var g_line;       // path

var canvas = document.querySelector('#holder > svg')
var clientRect = canvas.getBoundingClientRect();

canvas.onmousedown = function (e) {
    var target = e.target;
    if (target.nodeName !== 'circle'
        || !target.raphael) {
        return;
    }

    g_startNode = paper.getById(target.raphaelid);

    var x = g_startNode.attr('cx');
    var y = g_startNode.attr('cy');
    var start = 'M' + x + ' ' + y;
    var path = start + 'L' + (x + 1) + ' ' + (y + 1);
    g_line = paper.path(path);
    g_line.attr({'stroke-width': 2, 'stroke': '#cfcfcf', 'arrow-end': 'diamond'});
    g_line.start = start;
};

canvas.onmouseover = function (e) {
    var target = e.target;
    if (target.nodeName !== 'circle'
        || !target.raphael
        || !g_startNode) {
        return;
    }

    if (g_endNode && g_endNode.id === target.raphaelid) {
        return;
    }

    var node = paper.getById(target.raphaelid);
    if (g_startNode !== node) {
        g_endNode = node;
    }
};

canvas.onmousemove = function (e) {
    if (!g_line) {
        return;
    }

    var path = g_line.start;
    var offsetX = (e.clientX - clientRect.left);
    var offsetY = (e.clientY - clientRect.top);
    path += ' L' + offsetX + ' ' + offsetY;
    g_line.attr('path', path);
};

canvas.onmouseup = function (e) {
    if (!g_endNode) {
        if (g_line) {
            g_line.remove();
            g_line = null;
            g_startNode = null;
        }
        return;
    }

    if (!g_line) {
        return;
    }

    var path = g_line.start;
    var x = g_endNode.attr('cx');
    var y = g_endNode.attr('cy');
    g_line.attr('path', path + ' L' + x + ' ' + y);

    // BEGIN Create Edge
    var n1 = g_startNode.refNode;
    var n2 = g_endNode.refNode;
    g_edges.push(new Edge(n1, n2, g_line));
    // E N D Create Edge

    g_line = null;
    g_endNode = null;
    g_startNode = null;
};

function pick(min, max) {
    return min + ~~((max - min) * Math.random());
}

document.querySelector('#add-node').onclick = function () {
    var node = new Node(paper, {
        x: pick(0, 100),
        y: pick(0, 100),
        width: pick(150, 250),
        height: pick(30, 60),
        input: pick(0, 3),
        output: pick(1, 4)
    });
    node.moveable();
};

// var graph = new DirectedGraph();
// var n1 = graph.addNode(n1Config);
// var n2 = graph.addNode(n2Config);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);







/* vim: set ts=4 sw=4 sts=4 tw=120: */
