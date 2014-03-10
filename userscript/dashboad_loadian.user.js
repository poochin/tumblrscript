// ==UserScript==
// @name        Dashboard Loadian
// @namespace   https://github.com/poochin
// @include     /https?:\/\/www\.tumblr\.com\/(dashboard|likes|tagged).*/
// @version     1.1.3
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
        form: null
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


    /**
     * Dashboard で次ページ読み込みを開始するかどうかを判定する関数をラップします
     */

    function wrapperAutoPaginator() {

      var f = Tumblr.Events._events['DOMEventor:flatscroll'][1].callback;

      Tumblr.Events._events['DOMEventor:flatscroll'][1].callback = function dashboardLoadian(n) {

        if (document.querySelector('#dashboard_loadian_custom_form [name=dashboard_loadian_on]').checked) {

          var offset = parseInt(document.querySelector('#right_column [name=offset]').value);
          n = jQuery.extend({}, n, {windowScrollY: n.windowScrollY + (isNaN(offset) ? 0 : offset)});

        }

        f(n);
      };
    };

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
                f = Tumblr.Events._events['DOMEventor:flatscroll'].filter(function(o) {
                    return o.callback.name == 'dashboardLoadian';
                })[0].callback;

                f(n);
            }
            catch (e) { console.error(e); }

        }

        setTimeout(dashboardLoadian_autoLoader, 1000);
    }

    /**
     * 読み込みを開始するスクロール位置をカスタマイズするフォームを埋め込みます。
     */
    function embedCustomForm() {

        var right_column, form_html;

        form_html = [
            '<legend>Dashboard Loadian</legend>',
            '<label><input type="checkbox" name="dashboard_loadian_on" checked>On</label>: ',
            '<input size="3" type="text" name="offset" value="2000"/>',
            'px(Offset)',
            '<br />',
            '<label><input type="checkbox" name="dashboard_loadian_auto">Auto Loader</label>',
            ].join('');

        loadian.form = buildElement('fieldset',
            {id: 'dashboard_loadian_custom_form',
             style: 'border-radius: 6px'},
            form_html);

        right_column = document.querySelector('#right_column');
        right_column.appendChild(loadian.form);
    }


    /**
     * main 関数です
     **/

    function main() {

        embedCustomForm();

        execScript('void ' + wrapperAutoPaginator + '()');
        execScript(dashboardLoadian_autoLoader + '; dashboardLoadian_autoLoader()');
    }


    /**
     * 実行すべきページかどうかを判断します。
     * Opera 用のコードです。
     *
     * @return {Bool} 実行すべきページなら true を返します
     */
    function isExecPage() {

        return /^https?:\/\/www\.tumblr\.com\/dashboard.*/.test(location) ||
               /^https?:\/\/www\.tumblr\.com\/show.*/.test(location) ||
               /^https?:\/\/www\.tumblr\.com\/likes.*/.test(location) ||
               /^https?:\/\/www\.tumblr\.com\/tagged.*/.test(location);
    }


    /**
     * 始めに呼び出される関数です。
     * 実行すべきページの場合は main 関数を呼びだすようにします。
     */

    function boot() {

        if (isExecPage() === false) {
            return;
        }

        if (['complete', 'interactive'].indexOf(document.readyState) >= 0) {
            main(); /* 既に DOM 構築済みなので直接呼び出します  */
        }
        else {
            window.document.addEventListener('DOMContentLoaded', main, false);
        }
    }
})()
