// ==UserScript==
// @name        Dashboard Loadian
// @match       http://www.tumblr.com/dashboard*
// @version     1.0.2
// @description ダッシュボードの読み込み位置を前倒しします
// 
// @author      poochin
// @license     MIT
// @updated     2012-06-16
// @updateURL   https://gist.github.com/2931134
// ==/UserScript==

(function DashboardLoadian() {
    'use strict';

    var loadian = {
        OFFSET: 10000, /* 読み込みを開始する下からのスクロール位置 */
        form: null
    };

    boot();

    /**
     * クライアントエリアのスクロール位置、画面サイズを取得します
     * @return {Object} left, top, width, height を備えた辞書を返します
     */
    function viewportRect() {
        return {
            left: document.documentElement.scrollLeft || document.body.scrollLeft,
            top: document.documentElement.scrollTop || document.body.scrollTop,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight};
    }

    /**
     * 読み込み可能な状態ならば次ページの読み込みを開始させます。
     * この関数はクライアントページで実行させるため、
     * ユーザスクリプト上にない変数・関数を用いています。
     */
    var loadAsPossible = function() {
        if (!loading_next_page) {
            loading_next_page = true;
            retry_auto_paginator_request();
        }
    };

    /**
     * Scroll Event 時にスクロール位置を元に次ページの読み込みを開始するか決めます。
     */
    function onscroll() {
        var vr = viewportRect();
        if (document.documentElement.offsetHeight - (vr.top + vr.height) < loadian.OFFSET) {
            location.assign('javascript: void ' + loadAsPossible + '()');
        }
    }

    /**
     * 読み込みを開始するスクロール位置をカスタマイズするフォームを埋め込みます。
     */
    function embedCustomForm() {
        var right_column, form;

        form = [
            '<fieldset id="dashboard_loadian_custom_form" style="border-radius: 6px;">',
            '<legend>Dashboard Loadian</legend>',
            'Offset(px):',
            '<input size="3" type="text" name="offset" value="10000"/>',
            '<button>Update</button>',
            '</fieldset>'].join('');

        right_column = document.querySelector('#right_column');
        right_column.innerHTML += form;

        loadian.form = right_column.querySelector('#dashboard_loadian_custom_form');
        loadian.form.querySelector('button').addEventListener('click', function(e){
            loadian.OFFSET = parseInt(loadian.form.querySelector('[name=offset]').value);
        }, false);
    }

    /** main 関数です */
    function main() {
        window.addEventListener('scroll', onscroll, false);
        embedCustomForm();
    }

    /**
     * 実行すべきページかどうかを判断します。
     * Opera 用のコードです。
     * @return {Bool} 実行すべきページなら true を返します
     */
    function isExecPage() {
        return /^https?:\/\/www\.tumblr\.com\/dashboard.*/.test(location);
    }

    /**
     * 始めに呼び出される関数です。
     * 実行すべきページの場合は main 関数を呼びだすようにします。
     */
    function boot() {
        if (isExecPage() === false) {
            return;
        }

        if (window.document.body) {
            main();
        }
        else {
            window.document.addEventListener('DOMContentLoaded', main, false);
        }
    }
})()
