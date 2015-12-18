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
 * @file src/app.js
 * @author leeight
 */

define(function (require) {
    var exports = {};

    var Ext = require('./raphael.ext');
    Ext.init(Raphael);

    var Node = require('./Node');
    var Editor = require('./Editor');

    function start() {
        /*eslint-disable*/
        var paper = Raphael('holder', 640, 480);
        /*eslint-enable*/

        // var circle = paper.circle(300, 300, 30);
        // circle.cross();

        var editor = new Editor(paper);
        editor.init();

        var node = new Node(paper, {
            x: 5, y: 5,
            width: 300, height: 50,
            text: 'hello world',
            icon: 'fa://\uf09b',
            radius: 5,
            input: 1,
            output: 2
        });
        node.moveable();
        editor.addNode(node);

        var node2 = new Node(paper, {
            x: 100, y: 100,
            width: 100, height: 30,
            icon: 'fa://\uf28e',
            input: 1,
            output: 3
        });
        node2.moveable();
        editor.addNode(node2);

        document.querySelector('#add-node').onclick = function () {
            editor.generateNode();
        };
    }

    exports.start = start;

    return exports;
});







/* vim: set ts=4 sw=4 sts=4 tw=120: */
