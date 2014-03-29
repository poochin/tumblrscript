// ==UserScript==
// @name        Dashboard Loadian
// @namespace   https://github.com/poochin
// @include     /https?:\/\/www\.tumblr\.com\/(dashboard|likes|tagged|search).*/
// @include     /https?:\/\/www\.tumblr\.com\/(reblog|likes|liked\/by|blog|tagged)(\/.*)?/
// @version     1.2.0
// @description ダッシュボードの読み込み位置を前倒しします
// 
// @author      poochin
// @license     MIT
// @updated     2012-06-16
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/dashboad_loadian.user.js
// ==/UserScript==

(function DashboardLoadian() {
    'use strict';

    var loadian = {
        OFFSET: 10000, /* デフォルトの読み込みを開始する下からのスクロール位置 */
        form: null,
    };

    boot();

    /**
     * buildElement
     * Node を作成し各種データを同時にセットします
     * 
     * @param {String} tag_name タグ名.
     * @param {Object} propaties 辞書型のデータ.
     * @param {String} HTML 文字列.
     * @return {Object} 作成した Node を返します.
     */

    function buildElement(tag_name, propaties, innerHTML) {

        var elm = document.createElement(tag_name);
    
        for (var key in (propaties || {})) {

            elm.setAttribute(key, propaties[key]);
        }
    
        elm.innerHTML = innerHTML || '';
        return elm;
    }


    /**
     * クライアント領域で Script を実行します
     * @param {String} code 実行したいコード
     */

    function execScript(code) {

        var script = document.createElement('script');

        script.setAttribute('type', 'text/javascript');
        script.innerHTML = code;

        script.addEventListener('onload', function(e) {

            var elm = e.target;
            elm.parentNode.removeChild(elm);
        });

        document.body.appendChild(script);
    };

    function dashboardLoadian_BeforePagination(n) {

        if (document.querySelector('#dashboard_loadian_custom_form [name=dashboard_loadian_on]').checked) {
            var offset = parseInt(document.querySelector('#right_column [name=offset], .right_controls [name=offset]').value);
            n.windowScrollY = n.windowScrollY + (isNaN(offset) ? 0 : offset);
        }

    }

    function dashboardLoadian_AfterPagination(n) {

        if (document.querySelector('#dashboard_loadian_custom_form [name=dashboard_loadian_on]').checked) {
            var offset = parseInt(document.querySelector('#right_column [name=offset], .right_controls [name=offset]').value);
            n.windowScrollY = n.windowScrollY - (isNaN(offset) ? 0 : offset);
        }
    }

    function initDashboardLoadianInClientArea() {

        var i, fl;

        fl = Tumblr.Events._events['DOMEventor:flatscroll'];

        fl.splice(1, 0, {callback: dashboardLoadian_BeforePagination});

        for (i = 0; i < fl.length; ++i) {
            if (fl[i].callback.name == 'f') {
                break;
            }
            if (fl[i].ctx && fl[i].ctx.auto_pager) {
                break;
            }
        }

        fl.splice(i + 1, 0, {callback: dashboardLoadian_AfterPagination});
    }

    function dashboardLoadian_autoLoader() {

        var n = {
            documentHeight:  document.body.scrollHeight,
            windowHeight:    document.documentElement.clientHeight,
            windowWidth:     document.documentElement.clientWidth,
            windowScrollTop: document.documentElement.scrollTop || document.body.scrollTop,
            windowScrollY: document.documentElement.scrollTop || document.body.scrollTop
        };

        var f;

        if (document.querySelector('#dashboard_loadian_custom_form [name=dashboard_loadian_auto]').checked) {

            try {
                Tumblr.Events._events['DOMEventor:flatscroll'].map(function(o) {
                    console.log(o);
                    if (o.ctx) {
                        o.callback.apply(o.ctx, [n]);
                    }
                    else {
                        o.callback(n);
                    }
                });
            }
            catch (e) { console.error(e); }

        }

        setTimeout(dashboardLoadian_autoLoader, 1000);
    }

    function dashboardLoadian_autoLoaderInSearch() {

        if (document.querySelector('#dashboard_loadian_custom_form [name=dashboard_loadian_auto]').checked) {

            Tumblr.Autopager.prototype.should_auto_paginate();
        }

        setTimeout(dashboardLoadian_autoLoaderInSearch, 1000);
    }

    /**
     * 読み込みを開始するスクロール位置をカスタマイズするフォームを埋め込みます。
     */
    function embedCustomForm() {

        var right_column, form_html;

        form_html = [
            '<legend>Dashboard Loadian</legend>',
            '<label><input type="checkbox" name="dashboard_loadian_on" checked>On</label>: ',
            '<input size="3" type="text" name="offset" value="2000" />',
            'px(Offset)',
            '<br />',
            '<label><input type="checkbox" name="dashboard_loadian_auto">Auto Loader</label>',
            ].join('');

        loadian.form = buildElement('fieldset',
            {id: 'dashboard_loadian_custom_form',
             style: 'border-radius: 6px'},
            form_html);

        right_column = document.querySelector('#right_column');
        if (right_column) {

            right_column.appendChild(loadian.form);
        }
        else {

            loadian.form.style.clear = 'both';

            right_column = document.querySelector('.right_controls');
            right_column.appendChild(loadian.form);

            loadian.form.querySelector('[name=dashboard_loadian_on]').setAttribute('onchange', "Tumblr.Autopager.prototype.options.offset = document.querySelector('.right_controls [name=offset]').value * this.checked;");
            loadian.form.querySelector('[name=offset]').setAttribute('onkeyup', "Tumblr.Autopager.prototype.options.offset = this.value;");
        }
    }


    function initInDashboard() {

        embedCustomForm();

        execScript(dashboardLoadian_BeforePagination);
        execScript(dashboardLoadian_AfterPagination);
        execScript(initDashboardLoadianInClientArea + '; initDashboardLoadianInClientArea();');
        execScript(dashboardLoadian_autoLoader + '; dashboardLoadian_autoLoader()');
    }

    function initInSearch() {

        embedCustomForm();

        execScript(dashboardLoadian_autoLoaderInSearch + '; dashboardLoadian_autoLoaderInSearch()');
        execScript("Tumblr.Autopager.prototype.options.offset = document.querySelector('.right_controls [name=offset]').value;");
    }


    /**
     * main 関数です
     **/

    function main() {

        if (document.querySelector('#right_column')) {

            initInDashboard();
        }
        else {

            initInSearch();
        }
    }

    /**
     * 始めに呼び出される関数です。
     * 実行すべきページの場合は main 関数を呼びだすようにします。
     */

    function boot() {

        if (['complete', 'interactive'].indexOf(document.readyState) >= 0) {
            main(); /* 既に DOM 構築済みなので直接呼び出します  */
        }
        else {
            window.document.addEventListener('DOMContentLoaded', main, false);
        }
    }
})()
