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

function Node(paper, config) {
    this.paper = paper;
    this.rect = paper.rect(config.x, config.y,
        config.width, config.height, config.radius || 5);
    this.circles = this._initInputAndOutput(config);
    this.group = paper.set();
    this.group.push.apply(this.group, [this.rect].concat(this.circles));

    var color = Raphael.getColor();
    this.group.attr({fill: '#fff', stroke: '#fff', cursor: 'move'});
    this.rect.attr({fill: color});
}

Node.prototype._initInputAndOutput = function (config) {
    var circles = [];
    if (config.input) {
        var step = (config.width / (config.input + 1));
        for (var i = 0; i < config.input; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y;
            circles.push(
                this.paper.circle(x, y, 5)
            );
        }
    }
    if (config.output) {
        var step = (config.width / (config.output + 1));
        for (var i = 0; i < config.output; i ++) {
            var x = config.x + (i + 1) * step;
            var y = config.y + config.height;
            circles.push(
                this.paper.circle(x, y, 5)
            );
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







/* vim: set ts=4 sw=4 sts=4 tw=120: */
