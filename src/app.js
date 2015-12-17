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
    var exports = {};

    var Ext = require('./raphael.ext');
    Ext.init(Raphael);

    var Node = require('./Node');
    var Editor = require('./Editor');
    var ContextMenu = require('./ContextMenu');
    var util = require('./util');

    function start() {
        var paper = Raphael('holder', 640, 480);

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

        var circle = paper.circle(300, 300, 30);
        circle.cross();

        var svg = document.querySelector('#holder > svg');
        var editor = new Editor(svg, paper);
        editor.init();

        document.querySelector('#add-node').onclick = function () {
            var width = util.pick(150, 250);
            var height = util.pick(30, 60);
            var node = new Node(paper, {
                x: util.pick(0, 640 - width),
                y: util.pick(0, 480 - height),
                width: width,
                height: height,
                input: util.pick(0, 3),
                output: util.pick(1, 4)
            });
            node.moveable();
        };
    }

    exports.start = start;

    return exports;
});







/* vim: set ts=4 sw=4 sts=4 tw=120: */
