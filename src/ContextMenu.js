/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

define(function (require) {

    /**
     * 右键菜单.
     *
     * @constructor
     */
    function ContextMenu() {
        this.el = $('<div />').attr('class', 'ui-menu');
        this.el.on('click', 'li', this.onSelectMenu.bind(this));
        this._target = null;
        $(document.body).append(this.el);
    }

    /**
     * 点击不同的元素，可能需要展示的菜单项是不同的
     *
     * @param {Array.<string>} items 需要展示的菜单项目.
     */
    ContextMenu.prototype.setItems = function (items) {
        var html = '<ul>';
        items.forEach(function (item, index) {
            html += '<li data-index="' + index + '">' + item + '</li>';
        });
        html += '</ul>';
        this.el.html(html);
        return this;
    };

    ContextMenu.prototype.setTarget = function (target) {
        this._target = target;
        return this;
    };

    ContextMenu.prototype.onSelectMenu = function (e) {
        var command = $(e.target).html();
        if (typeof this.onselected === 'function') {
            try {
                this.onselected({
                    type: command,
                    target: this._target
                });
            }
            catch (ex) {
                console.error(ex);
            }
        }
        this.hide();
    };

    ContextMenu.prototype.moveTo = function (x, y) {
        this.el.css({left: x, top: y});
        return this;
    };

    ContextMenu.prototype.show = function () {
        this.el.show();
        return this;
    };

    ContextMenu.prototype.hide = function () {
        this.el.hide();
        return this;
    };

    return ContextMenu;

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
