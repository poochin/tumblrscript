// ==UserScript==
// @name        Dashboard Loadian
// @namespace   https://github.com/poochin
// @include     http://www.tumblr.com/dashboard*
// @include     http://www.tumblr.com/show*
// @include     http://www.tumblr.com/likes*
// @include     http://www.tumblr.com/tagged*
// @version     1.1.2
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
     * Node を作成し各種データを同時にセットします
     * @param {String} tag_name タグ名.
     * @param {Object} propaties 辞書型のデータ.
     * @param {String} HTML 文字列.
     * @return {Object} 作成した Node を返します.
     */
    /* buildElement */
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
            (function letit(elm) {
                elm.parentNode.removeChild(elm);
            })(e.target);
        });
        document.body.appendChild(script);
    };

    /**
     * Dashboard で次ページ読み込みを開始するかどうかを判定する関数をラップします
     */
    function wrapperAutoPaginator() {
      var f = Tumblr.Events._events['DOMEventor:flatscroll'][1].callback;
      Tumblr.Events._events['DOMEventor:flatscroll'][1].callback = function(n){
        if (document.querySelector('[name=dashboard_loadian_on]').checked) {
          var offset = parseInt(document.querySelector('#right_column [name=offset]').value);
          n = jQuery.extend({}, n, {windowScrollY: n.windowScrollY + (isNaN(offset) ? 0 : offset)});
        }
        f(n);
      };
    };

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
            ].join('');

        loadian.form = buildElement('fieldset',
            {id: 'dashboard_loadian_custom_form;',
             style: 'border-radius: 6px'},
            form_html);

        right_column = document.querySelector('#right_column');
        right_column.appendChild(loadian.form);
    }

    /** main 関数です */
    function main() {
        embedCustomForm();
        execScript('void ' + wrapperAutoPaginator + '()');
    }

    /**
     * 実行すべきページかどうかを判断します。
     * Opera 用のコードです。
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
