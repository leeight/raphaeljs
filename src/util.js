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
 * @file src/util.js
 * @author leeight
 */

define(function (require) {
    var exports = {};

    var uuid = 0x8964;
    var pool = {};

    var RaphaelElement = Raphael.el.constructor;

    exports.pick = function (min, max) {
        return min + ~~((max - min) * Math.random());
    };

    exports.path2curve = function (x1, y1, x4, y4) {
        var dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        // var dy = Math.max(Math.abs(y1 - y4) / 2, 10);

        var x2 = x1 + dx;
        var y2 = y1;
        var x3 = x4 - dx;
        var y3 = y4;

        var path = [
            'M', x1.toFixed(3), y1.toFixed(3),
            'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)
        ].join(',');

        return path;
    };

    /**
     * 获取实例的信息，例如 Node，Edge 之类的
     *
     * @param {string} sId The instance id.
     * @return {?Object}
     */
    exports.getInstance = function (sId) {
        return pool[sId];
    };

    exports.Base = function () {
        this._id = (uuid++).toString(36);
        pool[this._id] = this;
    };

    exports.onStart = function (object) {
        for (var p in object) {
            if (!object.hasOwnProperty(p)) {
                continue;
            }
            var value = object[p];
            if (!(value instanceof RaphaelElement)) {
                continue;
            }
            // TODO
        }
    };

    exports.remove = function () {
        for (var i = 0; i < arguments.length; i++) {
            var item = arguments[i];
            if (!item) {
                continue;
            }

            if (Array.isArray(item)) {
                item.forEach(function (child) {
                    if (child && typeof child.remove === 'function') {
                        try {
                            child.remove();
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                });
            }
            else if (typeof item.remove === 'function') {
                try {
                    item.remove();
                }
                catch (ex) {
                    console.error(ex);
                }
            }
        }
    };

    return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
