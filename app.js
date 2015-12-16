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

// 鼠标点击下去时候的 circle
var g_startNode;  // circle

// 鼠标松开时候的 circle
var g_endNode;    // circle

// 需要画的线
var g_line;       // path

function Node(paper, config) {
    this.paper = paper;
    this.rect = paper.rect(config.x, config.y,
        config.width, config.height, config.radius || 5);

    this.circles = this._initInputAndOutput(config);

    var color = Raphael.getColor();
    this.group = paper.set();
    this.group.push.apply(this.group, this.circles);
    this.group.attr({fill: '#fff', stroke: '#fff', cursor: 'pointer'});

    this.rect.attr({fill: color, cursor: 'move', stroke: '#cfcfcf'});
}

Node.prototype._initInputAndOutput = function (config) {
    function enlargeCircle(e) {
        this.or = this.attr('r');
        this.attr({r: 8});
    }

    function restoreCircleSize(e) {
        if (this.or) {
            this.attr({r: this.or});
        }
    }

    var node = this;
    var paper = node.paper;

    function startOfDrawLine() {
        if (g_line) {
            return;
        }

        // this -> paper.circle
        g_startNode = this;

        var x = this.attr('cx');
        var y = this.attr('cy');
        var start = 'M' + x + ' ' + y;
        var path = start + 'L' + (x + 1) + ' ' + (y + 1);
        console.log(path);
        g_line = paper.path(path);
        g_line.attr({'arrow-end': 'classic', 'stroke-width': 2, 'stroke': '#cfcfcf'});
        g_line.start = start;
    }

    function endOfDrawLine() {
        if (g_startNode !== this) {
            g_endNode = this;
        }
    }

    var circles = [];
    if (config.input) {
        var step = (config.width / (config.input + 1));
        for (var i = 0; i < config.input; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y;
            var circle = this.paper.circle(x, y, 5);
            circle.mouseover(enlargeCircle);
            circle.mouseout(restoreCircleSize);
            circle.mousedown(startOfDrawLine);
            circle.mouseup(endOfDrawLine);
            circles.push(circle);
        }
    }
    if (config.output) {
        var step = (config.width / (config.output + 1));
        for (var i = 0; i < config.output; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y + config.height;
            var circle = this.paper.circle(x, y, 5);
            circle.mouseover(enlargeCircle);
            circle.mouseout(restoreCircleSize);
            circle.mousedown(startOfDrawLine);
            circle.mouseup(endOfDrawLine);
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

document.querySelector('#holder > svg').onmousemove = function (e) {
    if (!g_line) {
        return;
    }

    var path = g_line.start;
    if (g_endNode) {
        var x = g_endNode.attr('cx');
        var y = g_endNode.attr('cy');
        g_line.attr('path', path + ' L' + x + ' ' + y);
        g_line = null;
        g_endNode = null;
        return;
    }

    path += ' L' + e.offsetX + ' ' + e.offsetY;
    console.log(path);
    g_line.attr('path', path);
};

// var graph = new DirectedGraph();
// var n1 = graph.addNode(n1Config);
// var n2 = graph.addNode(n2Config);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);
// graph.addEdge(n1, n2);







/* vim: set ts=4 sw=4 sts=4 tw=120: */
