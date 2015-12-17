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

Raphael.el.cross = function () {
    if (this.type !== 'circle') {
        return;
    }
    // this.attr({fill: "red"});

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
    var path = this.paper.path(path).attr({
        'stroke': "red", cursor: 'pointer',
        'stroke-width': 2,
        'clip-rect': (cx - r / 2) + ',' + (cy - r / 2) + ',' + r + ',' + r
    });
};

var circle = paper.circle(300, 300, 30);
circle.cross();


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
    var path = path2curve(start[1], start[2], end[5] + dx, end[6] + dy);
    this.line.attr('path', path);
};

Edge.prototype.onMoveStartPoint = function (dx, dy) {
    var savedPath = this.line.__path;
    var start = savedPath[0];
    var end = savedPath[1];
    var path = path2curve(start[1] + dx, start[2] + dy, end[5], end[6]);
    this.line.attr('path', path);
};

function Node(paper, config) {
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
            var circle = this.rect.paper.circle(x, y, 5);
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
            var circle = this.rect.paper.circle(x, y, 5);
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
    this.rect.animate({"fill-opacity": .2}, 500);
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
    this.rect.animate({"fill-opacity": 1}, 500);
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
    var start = ['M', x, y];
    var path = [start, ['L', (x + 1), (y + 1)]];
    g_line = paper.path(path);
    g_line.attr({'stroke-width': 2, 'stroke': '#cfcfcf',
        'arrow-end': 'diamond-wide', 'stroke-dasharray': '-.',
        'cursor': 'pointer'});
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

    var start = g_line.start;
    var offsetX = (e.clientX - clientRect.left);
    var offsetY = (e.clientY - clientRect.top);
    var path = [start, ['L', offsetX, offsetY]];
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

    var start = g_line.start;
    var x = g_endNode.attr('cx');
    var y = g_endNode.attr('cy');
    var path = path2curve(start[1], start[2], x, y);
    g_line.attr({'path': path, 'stroke-dasharray': 'none'});
    g_endNode.attr({'opacity': 0});
    g_startNode.attr({'fill': 'black'});

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
    var width = pick(150, 250);
    var height = pick(30, 60);
    var node = new Node(paper, {
        x: pick(0, 640 - width),
        y: pick(0, 480 - height),
        width: width,
        height: height,
        input: pick(0, 3),
        output: pick(1, 4)
    });
    node.moveable();
};

function path2curve(x1, y1, x4, y4) {
    var dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    var dy = Math.max(Math.abs(y1 - y4) / 2, 10);

    var x2 = x1 + dx;
    var y2 = y1;
    var x3 = x4 - dx;
    var y3 = y4;

    var path = [
        "M", x1.toFixed(3), y1.toFixed(3),
        "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)
    ].join(",");

    return path;
}

// var graph = new DirectedGraph();
// var n1 = graph.addNode(n1Config);
// var n2 = graph.addNode(n2Config);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);







/* vim: set ts=4 sw=4 sts=4 tw=120: */
