// ==UserScript==
// @name        Tumblr Tornado
// @version     1.1.13
// @description Tumblr にショートカットを追加するユーザスクリプト
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/dashboard/*
// @match       http://www.tumblr.com/likes
// @match       http://www.tumblr.com/likes/*
// @match       http://www.tumblr.com/blog/*
// @match       http://www.tumblr.com/tagged/*
// @match       http://www.tumblr.com/show/*
// 
// @author      poochin
// @license     MIT
// @updated     2012-12-09
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/tumblr_tornado.user.js
// ==/UserScript==

/**
 * @namespace TumblrTornado
 */
(function TumblrTornado() {
/*+
 * ページに埋め込むスタイルシート
 */
var embed_css = [
    /* Pin Notification */
    "#pin_notification_board {",
    "    position: fixed;",
    "    right: 15px;",
    "    bottom: 0;",
    "}",
    ".pin_notification.error {",
    "    color: red;",
    "}",
    ".pin_notification {",
    "    -webkit-animation: pin_notification_animation 3s forwards;",
    "    -moz-animation: pin_notification_animation 3s forwards;",
    "    -o-animation: pin_notification_animation 3s forwards;",
    "    padding: 5px;",
    "    border-left: 2px solid #888;",
    "    border-right: 2px solid #888;",
    "    border-bottom: 1px dashed #696;",
    "    background: #efefef;",
    "}",
    ".pin_notification:first-child {",
    "    border-top-left-radius: 5px;",
    "    border-top-right-radius: 5px;",
    "    border-top: 2px solid #888;",
    "}",
    ".pin_notification:last-child {",
    "    margin-bottom: 8px;",
    "    border-bottom-left-radius: 5px;",
    "    border-bottom-right-radius: 5px;",
    "    border-bottom: 2px solid #888;",
    "}",
    ".pin_notification:last-child:after {",
    "    content: ' ';",
    "    display: block;",
    "    position: absolute;",
    "    height: 0;",
    "    width: 0;",
    "    margin-top: 5px;",
    "    margin-left: 5px;",
    "    border: 8px solid #efefef;",
    "    border-color: transparent;",
    "    border-top-color: #888;",
    "    border-bottom-width: 0px;",
    "}",
    "@-webkit-keyframes pin_notification_animation {",
    "    0%   { opacity: 0; }",
    "    5%   { opacity: 1; }",
    "    90%  { opacity: 1; }",
    "    100% { opacity: 0; }",
    "}",
    "@-moz-keyframes pin_notification_animation {",
    "    0%   { opacity: 0; }",
    "    5%   { opacity: 1; }",
    "    90%  { opacity: 1; }",
    "    100% { opacity: 0; }",
    "}",
    "@keyframes pin_notification_animation {",
    "    0%   { opacity: 0; }",
    "    5%   { opacity: 1; }",
    "    90%  { opacity: 1; }",
    "    100% { opacity: 0; }",
    "}",
    /* Reblog Shutter */
    "#posts > .post.shutter_base {",
    "    background-color: #F8ABA6;",
    "}",
    "#posts > .post.shutter_base.shuttering {",
    "    -webkit-transition: background-color 0.08s ease;",
    "    -moz-transition: background-color 0.08s ease;",
    "    -o-transition: background-color 0.08s ease;",
    "    transition: background-color 0.08s ease;",
    "    background-color: #fff;",
    "}",
    /* Reblog Button */
    ".reblog_button.loading {",
    // "    background-position: -530px -270px !important;",
    "    -webkit-animation: reblogging 1s infinite;",
    "    -moz-animation: reblogging 1s infinite;",
    "}",
    "@-webkit-keyframes reblogging {",
    "  0% { -webkit-transform: rotate(0deg) scale(1.5, 1.5); }",
    "  25% { -webkit-transform: rotate(360deg) scale(1, 1); }",
    "  40% { -webkit-transform: rotate(360deg) scale(1, 1); }",
    "  50% { -webkit-transform: rotate(360deg) scale(1.1, 1.1); }",
    "  55% { -webkit-transform: rotate(360deg) scale(1, 1); }",
    "  100% { -webkit-transform: rotate(360deg) scale(1, 1); }",
    "}",
    "@-moz-keyframes reblogging {",
    "  0% { -moz-transform: rotate(0deg) scale(1.5, 1.5); }",
    "  25% { -moz-transform: rotate(360deg) scale(1, 1); }",
    "  40% { -moz-transform: rotate(360deg) scale(1, 1); }",
    "  50% { -moz-transform: rotate(360deg) scale(1.1, 1.1); }",
    "  55% { -moz-transform: rotate(360deg) scale(1, 1); }",
    "  100% { -moz-transform: rotate(360deg) scale(1, 1); }",
    "}",
    /* Lite Dialog */
    ".lite_dialog {",
    "  background-color: #fff;",
    "  padding: 2px;",
    "  z-index: 10;",
    "  position: absolute;",
    "  top: 0;",
    "  left: 0;",
    "  min-width: 200px;",
    "  max-width: 200px;",
    "  border-radius: 3px;",
    "  -webkit-box-shadow: 0 0 6px #000;",
    "  -moz-box-shadow: 0 0 6px #000;",
    "  box-shadow: 0 0 6px #000;",
    "}",
    ".lite_dialog_sysbar { }",
    ".lite_dialog_sysbar:after {",
    "  content: '';",
    "  clear: both;",
    "  height: 0;",
    "  display: block;",
    "  visibility: hidden;",
    "}",
    ".lite_dialog_close {",
    "  line-height: 16px;",
    "  width: 16px;",
    "  color: #888;",
    "  border: 1px dashed #888;",
    "  border-radius: 3px;",
    "  float: right;",
    "  cursor: pointer;",
    "  font-family: monospace;",
    "  text-align: center;",
    "}",
    ".lite_dialog_close:hover {",
    "  background-color: #ddd;",
    "}",
    ".lite_dialog_close:active, .lite_dialog_close:focus {",
    "  color: #aaa;",
    "}",
    ".lite_dialog_caption {",
    "  font-weight: bold;",
    "  margin-right: 20px;",
    "  padding: 5px;",
    "  line-height: 16px;",
    "  font-size: 12px;",
    "  color: #444;",
    "  cursor: move;",
    "  border-radius: 3px;",
    "}",
    ".lite_dialog_caption:hover {",
    "  background-color: #f8f8f8;",
    "}",
    ".lite_dialog_body {",
    "  margin-top: 2px;",
    "  padding: 3px;",
    "  border-top: 1px dotted #000;",
    "  border-radius: 3px;",
    "}",
    ".lite_dialog_body input[type='button'] {",
    "  text-align: left;",
    "  font-size: 24px;",
    "  width: 100%;",
    "}",
    ".lite_dialog_body input[type='button']:focus {",
    "  font-weight: bold;",
    "}",
    /* Shortcut Help */
    "#tornado_shortcuts_help {",
    "  color: #abb;",
    "  font-size: 12px;",
    "  line-height: 1.2em;",
    "}",
    "#tornado_shortcuts_help dd {",
    "  width: 203px;",
    "  overflow: hidden;",
    "}",
    "#tornado_shortcuts_help .more {",
    "  font-size: 8px;",
    "  cursor: pointer;",
    "}",
    "#tornado_shortcuts_help .hide {",
    "  display: none;",
    "}",
    "#tornado_shortcuts_help dt + dd code {",
    "  border-radius: 3px 0 0 0;",
    "}",
    "#tornado_shortcuts_help dd:last-child code {",
    "  border-radius: 0 0 0 3px;",
    "}",
    "#tornado_shortcuts_help dd {",
    "  margin-left: 1em;",
    "  height: 1.2em;",
    "}",
    "#tornado_shortcuts_help code {",
    "  background: #1C3752;",
    "}",
    "#tornado_shortcuts_help code:after {",
    "  content: ': ';",
    "  background: #2C4762;",
    "}",
    /* Clean Posts */
    ".empty_post {",
    "  background: #fff;",
    "  border-radius: 10px;",
    "  margin-top: 20px;",
    "}",
    ".empty_post.same_user_as_last {",
    "  margin-top: 7px;",
    "}",
].join('\n');

/**
 * クリックイベントです。
 * Node.dispatch(left_click) として使います。
 */
var left_click = document.createEvent("MouseEvent"); 
left_click.initEvent("click", false, true);

/* root info を取得するのに使います */
var API_KEY = 'kgO5FsMlhJP7VHZzHs1UMVinIcM5XCoy8HtajIXUeo7AChoNQo';

/**
 * Reblog 時 XHR のヘッダに埋め込む Content Type を指定する用の配列です
 */
var HeaderContentType = ["Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"];

/**
 * 配列同士を比較します 
 * @param {Array} another this と比較する配列
 * @returns {Bool} 同一なら true を、値が一つでも違えば false を返します
 */
Array.prototype.cmp = function(another) {
    return ((this.length != another.length)
        ? false
        : this.every(
            function(v, k) { return v == another[k]; }
          ));
};


/**
 * ビデオの開閉トグル関数です。
 * Tumblr application.js を元に Tumblr Tornado でも動くように移植しました
 * @param {Node} post 対象のビデオポスト要素
 */
function toggleVideoEmbed(post) {
    var post_id = post.id.match(/\d+/)[0],
        toggle = post.querySelector('.video_thumbnail'),
        embed = post.querySelector('.video_embed'),
        watch = post.querySelector('.video');
    if (watch.style.display == 'none') {
        embed.innerHTML = post.querySelector('input[id^="video_"]').value;
        toggle.style.display = 'none';
        watch.style.display = 'block';
    }
    else {
        embed.innerHTML = '';
        toggle.style.display = 'block';
        watch.style.display = 'none';
    }
}

/**
 * HTML 文字列から Node 群を返します
 * @param {String} html 作成した HTML 文字列.
 * @return {Object} HTML を元に作成した要素を持つ DocumentFragment.
 */
function buildElementBySource(html) {
    var range = document.createRange();
    range.selectNodeContents(document.body);
    return range.createContextualFragment(html);
}

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
 * document.querySelectorAll へのショートハンド
 * @param {String} selector CSS Selector
 * @return {Array} NodeList の Array に変換したもの
 */
function $$(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

/**
 * クライアントページでコードを実行します。
 * Google chrome と Opera では遅延実行が可能です。
 * @param {String} code 実行したいコード(// 行コメントは含めないでください).
 * @param {Number} lazy ミリ秒単位での遅延実行する時間。 デフォルトは 0 です.
 */
// TODO: このやり方をすると chrome では複数のスクリプトを一度に実行できないため script を埋め込む形にする
function execClient(code, lazy) {
    lazy = (typeof lazy == 'undefined' ? 0 : lazy);
    if (/Firefox/.test(navigator.userAgent)) {
        location.assign('javascript:' + code + '; void 0;');
    }
    else {
        setTimeout(function() {location.assign('javascript:' + code + '; void 0;')}, lazy);
    }
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
        with(e) {
            target.parentNode.removeChild(target);
        }
    });
}

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
 * 要素の位置、サイズを取得します
 * @TODO absolute, fixed な要素の子要素などは再帰的に親へ辿る必要があります
 * @return {Object} 要素の left, top, width, height を備えた辞書を返します
 */
function nodeRect (elm) {
    return {
        left: elm.offsetLeft,
        top: elm.offsetTop,
        width: elm.offsetWidth,
        height: elm.offsetHeight};
};

/**
 * キーイベント用の辞書を生成して返します
 * @TODO needpost オプションを設定
 * @param {String} match 最後に発火させる時のキー文字
 * @param {String}   func Tornado.commands の関数名
 * @param {Function} func 実行させたい関数
 * @param {Object} options 各種オプション
 * @returns {Object} キーイベント用の辞書型を返します
 */
function customkey(match, func, options) {
    if (typeof options == 'undefined') {
        options = {};
    }
    return {
        match: match,
        func: func,
        follows: options.follows || [],
        has_selector: options.has_selector || '',
        url: options.url || /.*/,
        shift: options.shift || false,
        ctrl: options.ctrl || false,
        alt: options.alt || false,
        usehelp: (typeof options.usehelp == 'undefined') ? true : options.usehelp,
        desc: options.desc || ''};
}

/**
 * ショートカットの一行ヘルプを作成して返します
 * @param {Object} shortcut customkey で作成したオブジェクト
 * @returns HTML 文字列を返します
 */
function buildShortcutLineHelp(shortcut) {
    var pre_spacing = ['&nbsp;', '&nbsp;', '&nbsp;'],
        key = [];

    key.push((shortcut.follows && shortcut.follows.join(' ')) || '');
    key.push((shortcut.shift && 's-') || '');
    key.push(shortcut.match.toUpperCase());

    key = key.join('');
    key = pre_spacing.slice(key.length).join('') + key;

    return [
        '<code>',
        key,
        '</code>',
        ((typeof shortcut == 'string')
            ? (shortcut)
            : (shortcut.desc || shortcut.func))].join('');
}

/**
 * 特定の関数は this があるオブジェクトを指している事を想定しています。
 * そのような関数を呼び出す際に self を指定すると func の this が self になったまま呼び出されます。
 * 使用目的として EventListener や setTimeout を想定しています。
 * @param {Object}   self func を呼び出した際 this にしたい変数
 * @param {Function} func 実行したい関数
 * @param {args}     デフォルトの引数
 * @returns 上記の目的を満たすクロージャ
 */
function preapply(self, func, args) {
    return function() {
        func.apply(self, (args || []).concat(Array.prototype.slice.call(arguments)));
    };
}

/**
 * 辞書型オブジェクトをクエリ文字列に変換します
 * @param {Object} dict 辞書型オブジェクト
 * @return {String} クエリ文字列
 */
function buildQueryString(dict) {
    if (typeof dict == 'undefined') {
        return '';
    }
    var queries = [];
    for (var key in dict) {
        queries.push([encodeURIComponent(key),
                      encodeURIComponent(dict[key])].join('='));
    }
    return queries.join('&');
}

/**
 * prototype.js 風な Ajax 関数
 * @param {String} url URL.
 * @param {Object} options 各オプションを持った辞書型オブジェクト.
 * @todo Ajax.Request では parameters は文字列ではなく辞書型オブジェクトで入ってくるかどうか
 */
function Ajax(url, options) {
    var xhr = this.xhr = new XMLHttpRequest(),
        async = (options.asynchronous == undefined) || options.asynchronous;

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var status = parseInt(xhr.status);
            if ((status / 100) == 2) {
                if (options.onSuccess) {
                    options.onSuccess(xhr);
                }
            }
            else if ((status / 100) >= 4) {
                if (options.onFailure) {
                    options.onFailure(xhr);
                }
            }
            if (options.onComplete) {
                options.onComplete(xhr);
            }
        }
    }

    if (options.method == undefined && options.parameters) {
        options.method = 'POST';
    }
    else if (options.method == undefined) {
        options.method = 'GET';
    }

    /* FIXME: PUT や DELETE にも対応 */
    if ('POST' != options.method.toUpperCase()) {
        url = [url, '?', options.parameters].join('');
        options.parameters = null;
    }
    else {
        options.requestHeaders = (options.requestHeaders || []).concat(HeaderContentType);
    }

    xhr.open(options.method, url, async);
    for (var i = 0; options.requestHeaders && i < options.requestHeaders.length; i += 2) {
        xhr.setRequestHeader(options.requestHeaders[i], options.requestHeaders[i + 1]);
    }
    xhr.send(options.parameters);
}

/**
 * クライアントエリアの右下にピンバルーンメッセージを表示します
 */
function PinNotification (message) {
    var board = document.querySelector('#pin_notification_board');
    if (!board) {
        board = document.body.appendChild(document.createElement('div'));
        board.id = 'pin_notification_board';
    }

    var elm = board.appendChild(document.createElement('div'));
    elm.className = 'pin_notification';
    elm.appendChild(document.createTextNode(message));

    setTimeout(function() { board.removeChild(elm); }, 3000);
}

/**
 * form の有効な値を集めます
 */
function gatherFormValues(form) {
    var values = {},
        items = form.querySelectorAll('input, textarea, select');
    Array.prototype.slice.call(items).filter(function(elm) {
        return (['checkbox', 'radio'].indexOf(elm.type) >= 0)
            ? elm.checked
            : !elm.disabled;
    }).map(function(elm){
        values[elm.name] = elm.value;
    });
    return values;
}

/**
 * 軽量なダイアログボックスを表示します
 * @class
 * @name LiteDialog
 * @param {String} title タイトル
 */
function LiteDialog(title) {
    /* ダイアログを移動する際にダイアログ左上からマウスまでの位置の差です */
    this.origin_offsetX = this.origin_offsetY = null;

    var dialog = this.dialog = document.createElement('div');
    dialog.object = dialog;
    dialog.className = 'lite_dialog';
    dialog.innerHTML = this.base_lite_dialog;

    var caption = dialog.querySelector('.lite_dialog_caption');
    caption.appendChild(document.createTextNode(title));
    caption.addEventListener('mousedown', preapply(this, this.mousedown));

    var close = dialog.querySelector('.lite_dialog_close');
    close.addEventListener('click', preapply(this, this.close));

    document.body.appendChild(dialog);
    this.centering();

    document.addEventListener('keydown', LiteDialog.prototype.keyevent, true);
}

LiteDialog.prototype = /** @lends LiteDialog.prototype */ {
    /**
     * lite_dialog のベース HTML
     * @TODO skelton
     */
    base_lite_dialog: [
        '<div class="lite_dialog_sysbar">',
        '  <div class="lite_dialog_sysmenus">',
        '    <span class="lite_dialog_close">× </span>',
        '  </div>',
        '  <div class="lite_dialog_caption">',
        '  </div>',
        '</div>',
        '<div classdiv class="lite_dialog_body">',
        '</div>'].join('')
    ,
    /**
     * LiteDialog のタイトルが掴まれた時の処理
     * @param {Object} e event
     */
    mousedown: function(e) {
        this.mousemove = preapply(this, this.mousemove);
        this.mouseup = preapply(this, this.mouseup);
  
        document.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mouseup', this.mouseup);
  
        this.origin_offsetX = e.clientX - this.dialog.offsetLeft;
        this.origin_offsetY = e.clientY - this.dialog.offsetTop;
    },
    /**
     * LiteDialog を移動している最中の処理
     * @param {Object} e event
     */
    mousemove: function(e) {
        this.dialog.style.top = (e.clientY - this.origin_offsetY) + 'px';
        this.dialog.style.left = (e.clientX - this.origin_offsetX) + 'px';
        window.getSelection().removeAllRanges();
    },
    /**
     * LiteDialog の移動終了の処理
     * @param {Object} e event
     */
    mouseup: function(e) {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mousemove', this.mouseup);
    },
    /**
     * LiteDialog を閉じる処理
     * @param {Object} e event
     */
    close: function(e) {
        this.dialog.parentNode.removeChild(this.dialog);
        this.dialog = undefined;
    },
    /**
     * LiteDialog 用のキーイベント
     * 同じイベントは何度登録しても重複(何度も)処理されません
     * @param {Object} e event
     */
    keyevent: function (e) {
        /* 数字キーが入力された際に対応したチャンネルのボタンをクリックします */
        if (document.querySelector('.lite_dialog')) {
            if (e.keyCode == 27) {
                document.querySelector('.lite_dialog_close').dispatchEvent(left_click);
            }
            else if (48 <= e.keyCode && e.keyCode <= 57) {
                /* 48 == '0', 57 == '9' */
                var number = parseInt(e.keyCode) - '0'.charCodeAt(0);
                var name = 'button' + number;
                document.querySelector('.lite_dialog input[type="button"].' + name).click();
            }
        }
    },
    /**
     * LiteDialog を画面中央に置きます
     */
    centering: function() {
        var elm = this.dialog,
            vr = viewportRect();
        elm.style.top = (vr.top + (vr.height / 2) - (elm.offsetHeight / 2)) + 'px';
        elm.style.left = (vr.left + (vr.width / 2) - (elm.offsetWidth / 2)) + 'px';
    },
};

/**
 * Tornado のメイン機能部
 * @namespace
 */
var Tornado = {
    /* const */
    KEY_MAX_FOLLOWS: 2,
    KEY_CONTINUAL_TIME: 2000, // milli

    /* variables */
    prev_cursor: null,
    state_texts: {'0': '', '1': 'drafts', '2': 'queue', 'private': 'private'},
    key_input_time: 0,  // 前回入力した時刻
    key_follows: [],
    /**
     * reblog を実行します。
     * @param {Node} post 対象の li.post
     * @param {Object} default_postdata 送信するポストデータ
     * @todo classList.add, remove を使ってみる
     */
    reblog: function(post, default_postdata) {
        Tornado.modules.shutterEffect(post);

        var reblog_button = post.querySelector('a.reblog_button');
        reblog_button.className += ' loading';

        new Ajax(reblog_button.href, {
            method: 'GET',
            onSuccess: function(_xhr) {
                var dummy_elm = buildElementBySource(_xhr.responseText);
    
                /* 有効な form データを集めます */
                var form = dummy_elm.querySelector('#content > form');
                var postdata = gatherFormValues(form);
                delete postdata['preview_post'];
                for (var name in (default_postdata || {})) {
                    postdata[name] = default_postdata[name];
                }

                new Ajax(form.action, {
                    method: form.method,
                    parameters: buildQueryString(postdata),
                    requestHeaders: HeaderContentType,
                    onSuccess: function(_xhr) {
                        var response_elm = buildElementBySource(_xhr.responseText);

                        if (response_elm.querySelector('ul#errors')) {
                            reblog_button.className = reblog_button.className.replace('loading', '');
                            alert(response_elm.querySelector('ul#errors').textContent.trim());
                        }
                        else {
                            reblog_button.className = reblog_button.className.replace(/\bloading\b/, 'reblogged');

                            var dp = default_postdata;
                            new PinNotification([
                                'Success: Reblogged',
                                (dp['post[state]'] && Tornado.state_texts[dp['post[state]']]) || '',
                                (dp['channel_id'] && dp['channel_id'] != '0' && dp['channel_id']) || ''].join(' '));
                        }
                    },
                });
            },
        });
    },
    /**
     * reblog 用のチャンネルダイアログを表示します。
     * @param {Node} post 対象の li.post
     * @param {Object} postdata 投稿タイプ等を保持した postdata
     */
    reblogToChannelDialog: function(post, postdata) {
        var state_text = Tornado.state_texts[postdata["post[state]"]] || '';
        var title = ['Reblog', (state_text) ? ('as ' + state_text) : ('') , 'to [channel]'].join(' ');

        var dialog = new LiteDialog(title);
        var dialog_body = dialog.dialog.querySelector('.lite_dialog_body');
    
        $$('#popover_blogs .popover_menu_item:not(#button_new_blog)').map(function(elm, i) {
            // $$('#all_blogs_menu .item[id]').map(function(elm, i) {
                var channel_id = elm.id.slice(9);
                var button = buildElement('input', {
                        type: 'button',
                        class: 'button' + (i + 1),
                        name: channel_id,
                        value: ['[', i + 1, ']: ', elm.children[1].textContent.trim()].join('')});
                button.addEventListener('click', function(e) {
                    postdata['channel_id'] = this.name;
                    Tornado.reblog(post, postdata);
                    dialog.close();
                });
                dialog_body.appendChild(button);
        });
    
        dialog.dialog.style.top = (post.offsetTop + 37) + 'px';
        dialog.dialog.style.left = (post.offsetLeft + 20) + 'px';

        dialog_body.querySelector('input[type="button"]').focus();
    },
    /**
     * delete, publish, queue フォームを Ajax を用いて実行します
     * @param {Node} form delete, publish, queue フォーム要素
     * @param {Function} onSuccess 成功時に呼び出される関数
     * @param {Function} onFailure 失敗時に呼び出される関数
     */
    submitPublish: function(form, onSuccess, onFailure) {
        new Ajax(form.action, {
            method: form.method,
            requestHeaders: HeaderContentType,
            parameters: buildQueryString(gatherFormValues(form)),
            onSuccess: onSuccess,
            onFailure: onFailure});
    },
    /**
     * 入力されたキーによってコマンドを実行します
     * @param {Object} e Eventオブジェクト
     */
    keyevent: function (e) {
        var post,
            margin_top = 7,  /* post 上部に 7px の余白が設けられます */
            vr = viewportRect(),
            ch = String.fromCharCode(e.keyCode);

        ch = (e.shiftKey ? ch.toUpperCase() : ch.toLowerCase());

        if (112 <= e.keyCode && e.keyCode <= 123) {
            return; /* Function keys */
        }
        else if (!(65 <= e.keyCode && e.keyCode <= 90)) {
            return; /* Not Alphabet */
        }

        /* 入力エリア、またはリッチテキストでは無効にします */
        if (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.className === 'mceContentBody') {
            return;
        }

        /* 連続キーバインド用 */
        if (Tornado.key_input_time + Tornado.KEY_CONTINUAL_TIME < new Date()) {
            Tornado.key_follows = [];
        }
        Tornado.key_input_time = new Date() * 1;
        Tornado.key_follows = Tornado.key_follows.concat(ch).slice(-Tornado.KEY_MAX_FOLLOWS);

        post = $$('#posts>.post:not(.new_post)').filter(function(elm) {
            return Math.abs(vr.top - (elm.offsetTop - margin_top)) < 5;
        })[0];
        if (!post) {
            console.info('Post not found');
        }

        Tornado.shortcuts.every(function(shortcut) {
            var match = shortcut.follows.concat(shortcut.shift
                ? shortcut.match.toUpperCase()
                : shortcut.match.toLowerCase());

            if (!shortcut.url.test(location) || 
                e.shiftKey != shortcut.shift ||
                e.ctrlKey != shortcut.ctrl ||
                e.altKey != shortcut.alt) {
                return true;
            }
            else if (shortcut.has_selector &&
                post &&
                !post.querySelector(shortcut.has_selector)) {
                return true;
            }
            else if (!match.cmp(Tornado.key_follows.slice(-(match.length)))) {
                return true;
            }

            if (typeof shortcut.func == 'string') {
                Tornado.commands[shortcut.func](post);
            }
            else {
                shortcut.func(post);
            }
            Tornado.key_follows = [];
            return false;
        });
    },
};

/**
 * @namespace
 */
Tornado.modules = {
    shutterEffect: function(post) {
        post.classList.remove('shuttering');
        post.classList.add('shutter_base');

        var delay_shutter = 0;
        if (/Firefox/.test(navigator.userAgent) ||
            /Opera/.test(navigator.userAgent)) {
            delay_shutter = 50;
        }

        setTimeout(
            function() { post.classList.add('shuttering'); },
            delay_shutter);
    },
};

/**
 * @namespace
 */
Tornado.commands = {
    /**
     * reblog
     */
    reblog: function(post) {
        Tornado.reblog(post, {'channel_id': '0'});
    },
    reblogToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'channel_id': '0'});
    },
    draft: function(post) {
        Tornado.reblog(post, {'post[state]': '1', 'channel_id': '0'});
    },
    draftToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': '1'});
    },
    queue: function(post) {
        Tornado.reblog(post, {'post[state]': '2', 'channel_id': '0'});
    },
    queueToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': '2'});
    },
    private: function(post) {
        Tornado.reblog(post, {'post[state]': 'private', 'channel_id': '0'});
    },
    privateToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': 'private'});
    },
    halfdown: function() {
        var view_height = window.innerHeight;
        window.scrollBy(0, +view_height / 2);
    },
    halfup: function() {
        var view_height = window.innerHeight;
        window.scrollBy(0, -view_height / 2);
    },
    goTop: function(post) {
        Tornado.prev_cursor = post;
        window.scroll(0, 0);
    },
    goBottom: function(post) {
        Tornado.prev_cursor = post;
        window.scroll(0, document.height || document.body.clientHeight);
    },
    jumpToLastCursor: function() {
        var y = Tornado.prev_cursor.offsetTop;
        Tornado.prev_cursor = null;
        window.scroll(0, y - 7);
    },
    fast_reblog: function(post) {
        var reblog_button = post.querySelector('a.reblog_button');
        var reblog_key = reblog_button.getAttribute('data-reblog-key'),
            reblog_id = reblog_button.getAttribute('data-reblog-id'),
            form_key = reblog_button.getAttribute('data-user-form-key');

        Tornado.modules.shutterEffect(post);
        reblog_button.className += ' loading';
        new Ajax('/fast_reblog', {
            method: 'POST',
            parameters: buildQueryString({reblog_key: reblog_key, reblog_post_id: reblog_id, form_key: form_key}),
            onSuccess: function(_xhr) {
                reblog_button.className = reblog_button.className.replace(/\bloading\b/, 'reblogged');
                new PinNotification('Success: fast Reblogged');
            },
            onFailure: function(_xhr) {
                alert('Error: ' + _xhr.responseText);
                reblog_button.className = reblog_button.className.replace('loading', '')
            },
        });
    },
    notes: function(post) {
        var notes_link = post.querySelector('.reblog_count');
        notes_link.dispatchEvent(left_click);

        new PinNotification('test');
    },
    scaleImage: function(post) {
        var reg_type = /\b(?:photo|regular|quote|link|conversation|audio|video)\b/;
        var type = post.className.match(reg_type)[0];
        if (type != "photo" && type != "video") {
            return;
        }

        if (type == "photo") {
            with({elm: post.querySelector('img.image_thumbnail') ||
                       document.querySelector('#tumblr_lightbox') ||
                       post.querySelector('a.photoset_photo')}) {
                elm.dispatchEvent(left_click);
            }
        }   
        else if (type == 'video') {
            toggleVideoEmbed(post);
        }   
    },
    cleanPosts: function(/* post */) {
        var vr = viewportRect(),
            i = 0;

        $$('#posts > li:not(.new_post)').filter(function(post) {
            return (post.offsetTop - 7) < vr.top;
        }).map(function(src_post) {
            var post = document.createElement('li');
            post.className = ['empty_post', src_post.className.match(/\bsame_user_as_last\b/)].join(' ');
            post.style.cssText = [
                'width:', src_post.offsetWidth, 'px;',
                'height:', src_post.offsetHeight, 'px;'].join('');
            src_post.parentNode.replaceChild(post, src_post);
            i++;
        });

        new PinNotification(i + '件のポストを空にしました。');
    },
    removePosts: function(/* posts */) {
        var dsbd = document.querySelector('#posts'),
            vr = viewportRect(),
            del_count = 0;

        $$('#posts > li:not(.new_post)').filter(function(post) {
            return (post.offsetTop - 7) < vr.top;
        }).map(function(post) {
            del_count++;
            dsbd.removeChild(post);
        });

        var firstpost = document.querySelector('#posts > li:not(.new_post)');
        firstpost.className = firstpost.className.replace('same_user_as_last', '');

        window.scrollTo(0, document.querySelector('#posts>.post:not(.new_post)').offsetTop - 7);

        new PinNotification(del_count + '件のポストを削除しました。');
    },
    removeBottomPosts: function(/* post */) {
        var dsbd = document.querySelector('#posts'),
            vr = viewportRect(),
            del_count = 0;

        execClient('next_page = null; loading_next_page = true;');
        document.body.style.marginBottom = '500px';

        $$('#posts > li:not(.new_post)').filter(function(post) {
            return (post.offsetTop - 7) > vr.top;
        }).map(function(post) {
            del_count++;
            dsbd.removeChild(post);
        });

        new PinNotification('現在より下のポストを' + del_count + '件のポストを削除しました。');
    },
    viewPostPageInBackground: function(post) {
        var permalink;
        if (permalink = post.querySelector('.permalink')) {
            window.open(permalink.href);
            window.focus();
        }
    },
    rootInfo:
    /**
     * @fixme "reblogged you:" の際には上手く動きません
     * @fixme private ポストでの取得には対応していません
     */
    function(post) {
        var post_id = post.id.match(/\d+/)[0];
        var post_info = post.querySelector('.post_info');
        if (post_info.querySelector('.root_info')) {
            return;
        }

        var root_info = document.createElement('span');
        root_info.className = 'root_info';
        root_info.innerHTML = ' [...]';
        post_info.insertBefore(root_info, post_info.lastChild);

        var script = document.createElement('script');
        script.id = 'showroot_' + post_id;

        var permalink = post.querySelector('a.permalink').href;
        var blog_name = permalink.match(/[^\/]*(?=\/(?:post|private))/)[0];
        var qs = buildQueryString({id: post_id , jsonp: 'jsonpRootInfo', reblog_info: 'true', api_key: API_KEY});
        var url = [
            'http://api.tumblr.com/v2/blog',
            blog_name,
            'posts?' + qs].join('/');
        script.src = url;

        document.body.appendChild(script);
    },
    topReload: function() {
        var reg_top_path = /^http:\/\/www.tumblr.com\/(?:dashboard|likes|(?:blog\/[^\/]+(?:\/drafts|queue)?)|(?:tagged\/[^?]+)|(?:show\/[^\/]+))/;
        var url = location.href.match(reg_top_path)[0];
        location.assign(url);
    },
    forceDelete: function(post) {
        Tornado.modules.shutterEffect(post);

        new PinNotification('Deleting... ' + post.id);
        Tornado.submitPublish(
            post.querySelector('form#delete_' + post.id),
            function(_xhr) {
                new PinNotification('Deleted ' + post.id);
            },
            function(_xhr) {
                alert('fail to delete');
            }
        );
    },
    delete: function(post) {
        Tornado.modules.shutterEffect(post);
        if (!confirm('Delete this post?')) {
            post.classList.remove('shutter_base');
            return;
        }

        new PinNotification('Deleting... ' + post.id);
        Tornado.submitPublish(
            post.querySelector('form#delete_' + post.id),
            function(_xhr) {
                new PinNotification('Deleted ' + post.id);
            },
            function(_xhr) {
                alert('fail to delete');
            }
        );
    },
    publish: function(post) {
        Tornado.modules.shutterEffect(post);

        new PinNotification('Publishing... ' + post.id);
        Tornado.submitPublish(
            post.querySelector('form#publish_' + post.id),
            function(_xhr) {
                new PinNotification('Published ' + post.id);
            },
            function(_xhr) {
                alert('fail to publish');
            }
        );
    },
    enqueue: function(post) {
        Tornado.modules.shutterEffect(post);

        new PinNotification('Enqueueing... ' + post.id);
        Tornado.submitPublish(
            post.querySelector('form#queue_' + post.id),
            function(_xhr) {
                new PinNotification('Enqueued ' + post.id);
            },
            function(_xhr) {
                alert('fail to enqueue');
            }
        );
    },
    default: function() {
        return true;  /* threw up event */
    },
};

Tornado.shortcuts = /** @lends Tornado */ [
    customkey('j', 'default', {desc: '次ポストへ移動'}),
    customkey('j', 'halfdown', {shift: true, usehelp: 'hide', desc: '下へ半スクロール'}),

    customkey('k', 'default', {desc: '前ポストへ移動'}),
    customkey('k', 'halfup', {shift: true, usehelp: 'hide', desc: '上へ半スクロール'}),

    customkey('l', 'default', {desc: 'Like'}),

    customkey('g', 'goTop', {follows: ['g'], usehelp: 'hide', desc: '一番上へスクロール'}),
    customkey('g', 'goBottom', {shift: true, usehelp: 'hide', desc: '一番下へスクロール'}),

    customkey('t', 'reblog'),
    customkey('h', 'fast_reblog'),
    customkey('d', 'draft', {desc: '下書きへ送る'}),
    customkey('q', 'queue', {desc: 'キューへ送る'}),
    customkey('p', 'private'),

    customkey('t', 'reblogToChannel', {follows: ['g'], desc: 'channelへリブログ'}),
    customkey('d', 'draftToChannel', {follows: ['g'], desc: 'channelへ下書き'}),
    customkey('q', 'queueToChannel', {follows: ['g'], desc: 'channelのキューへ送る'}),
    customkey('p', 'privateToChannel', {follows: ['g'], desc: 'channelのprivateでリブログ'}),

    customkey('i', 'scaleImage', {desc: 'photo, video を開閉'}),
    customkey('m', 'rootInfo', {desc: 'Root投稿者情報を取得します'}),
    customkey('v', 'viewPostPageInBackground', {usehelp: 'hide'}),

    customkey('c', 'cleanPosts', {usehelp: 'hide', desc: '現在より上のポストを空の状態にする'}),
    customkey('c', 'removePosts', {shift: true, usehelp: 'hide', desc: '現在より上のポストを画面から削除します'}),
    customkey('c', 'removeBottomPosts', {shift: true, follows: ['g'], usehelp: 'hide', desc: '現在より下のポストを画面から削除します'}),

    // customkey('n', 'notes', {usehelp: 'hide', desc: 'Notes を表示'}),
    customkey('r', 'topReload', {shift: true, usehelp: 'hide'}),
    customkey('o', 'jumpToLastCursor', {shift: true, usehelp: false}),

    customkey('d', 'delete', {has_selector: 'form[id^=delete]', usehelp: 'hide'}),
    customkey('d', 'forceDelete', {shift: true, has_selector: 'form[id^=delete]', usehelp: 'hide'}),
    customkey('p', 'publish', {has_selector: 'form[id^=publish]', usehelp: 'hide'}),
    customkey('q', 'enqueue', {has_selector: 'form[id^=queue]', usehelp: 'hide'}),
];

/**
 * RootInfo用のAPIのデータを受け取り実際に埋め込む関数です
 * @param {Object} json Tumblr API が返す JSON オブジェクト
 */
function jsonpRootInfo(json) {
    var post = json.response.posts[0];
    var root_name = post.reblogged_root_name;
    var root_url = post.reblogged_root_url;
    var text_root_link = (root_name ? (['<a href="', root_url, '">', root_name, '</a>'].join('')) : 'missing');

    var node_post = document.querySelector('#post_' + post.id);
    var root_info = node_post.querySelector('.root_info');
    root_info.innerHTML = ' [' + text_root_link + ']';

    var script = document.querySelector('#showroot_' + post.id);
    script.parentNode.removeChild(script);
}

/**
 * 自分からのリブログに対して .reblogged_you クラスを付けます。
 */
function add_reblogged_you() {
    $$('#posts>.post:not(.new_post)').slice(-10).map(function(post) {
        if (post.querySelector('.post_info') &&
            post.querySelector('.post_info').innerHTML.search('reblogged you:') >= 0) {
            post.className += ' reblogged_you';
        }
    });
}

/**
 * ロードの度にロケーションバーを書き換えるようにします
 */
function enhistory() {
    return [
        '(',
        function() {
            var papr = window._process_auto_paginator_response;
            window._process_auto_paginator_response = function(transport) {
                history.pushState('', '', window.next_page);
                papr(transport);
                add_reblogged_you();

                var next_page = next_pageCorrection();
                if (next_page) {
                    window.next_page = next_page;
                }
            }
        },
        ')();'].join('');
}

/**
 * 次ページパスを訂正すべき場合は正常な次ページパスを返します
 * @return 次ページ path か null
 */
function next_pageCorrection() {
    var m_path = location.href.match(/show\/(photos|text|quotes|links|chats|audio|videos)\/?(\d+)?/);
    if (m_path) {
        var path = [
            '/show',
            m_path[1],
            (m_path[2] == undefined)
                ? 2
                : parseInt(m_path[2]) + 1].join('/');
        return path;
    }
    return null;
};

/**
 * 右カラムにヘルプを表示します
 */
function showShortcutHelp() {
    var rightcolumn_help, header_help, helps;

    var rightcolumn_help = buildElement('div',
        {class: 'tornado_rightcolumn_help'});

    var header_help = buildElement('p',
        {}, 
        'Tumblr Tornado <span class="tornado_help">[?]</span>');

    header_help.querySelector('span').addEventListener('click', function(e) {
        var hides = document.querySelectorAll('#tornado_shortcuts_help .hide');
        hides = Array.prototype.slice.call(hides);
        hides.map(function(elm) {
            elm.className = '';
        });
    });

    rightcolumn_help.appendChild(header_help);

    var helps = buildElement('ul',
        {id: 'tornado_shortcuts_help'});

    Tornado.shortcuts.map(function(shortcut, i) {
        var className = (shortcut.usehelp == 'hide' && shortcut.usehelp);
        var help = buildElement('li', 
            {class: className},
            buildShortcutLineHelp(shortcut));
        helps.appendChild(help);
    });

    rightcolumn_help.appendChild(helps);

    with({right_column: document.querySelector('#right_column')}) {
        if (right_column) {
            right_column.appendChild(rightcolumn_help);
        }
    }
}

/**
 * ページロード時に一度だけ呼び出されます
 */
function main() {
    var keyevent = preapply(Tornado, Tornado.keyevent);
    document.addEventListener('keydown', keyevent, true);

    var style_element = document.createElement('style');
    style_element.Tornado = Tornado;
    style_element.className = 'tumblr_userscript';
    style_element.appendChild(document.createTextNode(embed_css));
    document.head.appendChild(style_element);

    showShortcutHelp();
    add_reblogged_you();

    var code = '';
    code += enhistory();
    code += add_reblogged_you;
    code += jsonpRootInfo;
    code += next_pageCorrection;
    if (/^https?:\/\/www\.tumblr\.com\/blog\/[^\/]+\/queue/.test(location)) {
        /* Queue ページで J/K キーが使用できない為、使えるようにします */
        code += 'Tumblr.enable_dashboard_key_commands=true;Tumblr.KeyCommands = new Tumblr.KeyCommandsConstructor();';
    }
    var next_page = next_pageCorrection();
    if (next_page) {
        code += 'window.next_page = "' + next_page + '";';
    }

    execClient(code, 1000);

    /* FIXME: URL も重み付けを行う */
    Tornado.shortcuts.sort(function(a, b) {
        return (b.follows.length - a.follows.length) ||
               (b.has_selector.length - a.has_selector.length);
    });
}

if (window.document.body) {
    if (/^https?:\/\/www\.tumblr\.com\//.test(location) /* for Opera */) {
        main();
    }
}
else {
    window.document.addEventListener('DOMContentLoaded', main, false);
}

})();


/*
* History *
2012-07-04
ver 1.1.7
    * viewPagePostInBackground を追加しました *

    @charz_red さんのアイディアによりポストを開く機能を付けました。
    自分のポストを Delete したい際に確認ダイアログを表示しない forceDelete 機能を付けました。

2012-06-08
ver 1.1.4
    * /show 系で変な next_page が設定される不具合を取りました *

2012-06-04
ver 1.1.3
    * reblog 時 に post を閃かせる効果を追加しました *

    @tantarotar さんの意見を採用して taberareloo + chormekeyconfig を用いた際の reblog 時の閃きを取り入れました。

2012-05-19
ver 1.1.2
    * removeBottomPosts を追加しました *

    @charz_red さんのアイディアで removeBottomPosts を組込みました。

2012-05-21
ver 1.1.1
    * リファクタリングを行いました *

2012-05-18
ver 1.1.0
    * コマンドを Tornado 直下から切り離すようにしました *

    jsdoc 向けのコメントを書きました

2012-05-04
ver 1.0.10
    * ポストが自分からのリブログだった際に .reblogged_you クラスを付けるようにしました。 *

2012-04-30
ver 1.0.9
    * Ajax クラスを prototype.js 風の引数を持つようにしました *

ver 1.0.8
    * Pin Notification の表示方法を変えました *

    Pin Notification バルーンが複数表示された際に一つのバルーンで表示するようにしました。

    Opera 向けに現在の URL をチェックする分岐を追加しました。

    quque ページでデフォルトのショートカットキー(J/K)が動作していなかったので動くようにしました。

2012-04-29
ver 1.0.7
    * is_mine のポストを queue, draft, delete する機能を付けました *

    customkey に子孫要素の css selector を探るオプションを付けることで、
    is_mine のポストで queue, draft, delete する機能を付けました。
    これによって drafts と delete は同じキーが割り当てられています。

2012-04-27
ver 1.0.6
    * shortcuts を dict から list に変更 *

    Tornado.shortcuts を辞書型からリスト型に変更しました。
    これによりヘルプの順序の設定が任意に行えるようになりました。

ver 1.0.5
    * トップリロード機能 *

    dashboard, likes, blog, drafts, queue などで各トップに飛ぶリロード機能を付けました。

2012-04-26
ver 1.0.4.0
    * リファクタリング *

    shortcuts の参照で重複している部分を一様にさばけるようにして keyevent や help をスリムにしました。

    video の拡縮を一様にトグルできるようにしました。

2012-04-25
ver 1.0.3.0
    * rootInfo を取得できるようにしました *

    最初にポストした投稿者の情報を取得する機能を付けました。

ver 1.0.2
    * ショートカットを拡張 *

    Shift+D などが思いの外使いづらかったので G-D とキーバインドを繋げられるようにしました。

2012-04-24
ver 1.0.1.0
    * Google chrome, Firefox+GM, Opera に対応 *

    box-shadow, animation を複数のブラウザに対応するように記述しました。

2012-04-23
ver 1.0.0.0
    * パイロット版を公開 *

    Google chrome 上でのみ動作するようにしています。

    Shift + Command でショートカットに拡張性をもたせやすい UserScript を目指して書きました。
    また既存の UserScript にはチャンネル投稿に対応したものが見当たらないので新しく書きました。

    autoload 時にロケーションバーに記憶させる案は Tumblr Life からいただきました。
    コピーはしていませんが、どのように書くのかをソースコードを読み勉強させてもらいました(実質コピー)。

    cleanPosts の案は SuperTumblr からいただきました。
    ただし li.post が残るとゆくゆくコマンドの遅延が危ぶまれるため .post を class から取り除くようにしています。
    また実装部分も SuperTumblr とは違う方法を取っています。
*/
