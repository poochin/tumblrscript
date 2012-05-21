// ==UserScript==
// @name        Skeltumblr
// @version     1.0.0
// @description Tumblr にショートカットを追加するユーザスクリプト
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/dashboard/*
// @match       http://www.tumblr.com/likes
// @match       http://www.tumblr.com/likes/*
// @match       http://www.tumblr.com/blog/*
// @match       http://www.tumblr.com/tagged/*
// @match       http://www.tumblr.com/show/*
// @author      poochin
// @license     MIT
// @updated     2012-05-18
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/skeltumblr.user.js
// ==/UserScript==

/**
 * @namespace TumblrTornado
 * @TODO /show/videos の次 URL をバグらないように修正する
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
].join('\n');

/**
 * クリックイベントです。
 * Node.dispatch(left_click) として使います。
 */
var left_click = document.createEvent("MouseEvent"); 
left_click.initEvent("click", false, true);

/**
 * Reblog 時 Content Type を指定する用の配列です
 */
var HeaderContentType = ["Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"];

/**
 * 配列同士を比較します 
 * @param {Array} another this と比較する配列
 * @returns {Bool} 同一なら true を、値が一つでも違えば false を返します
 */
Array.prototype.cmp = function(another) {
    return (this.length != another.length)
        ? false
        : this.every(
            function(v, k) { return v == another[k]; }
          );
};

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
function execClient(code, lazy) {
    lazy = (typeof lazy == 'undefined' ? 0 : lazy);
    if (/Firefox/.test(navigator.userAgent)) {
        location.assign('javascript:' + code);
    }
    else {
        setTimeout(function() {location.assign('javascript:' + code)}, lazy);
    }
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
 * 特定の関数は this があるオブジェクトを指している事を想定して作られています。
 * そのような関数を呼び出す際にこの関数経由で self を指定して実行すると、
 * func の this が self になったまま呼び出されます。
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
 */
function Ajax(url, options) {
    var xhr = this.xhr = new XMLHttpRequest();
    var async = (options.asynchronous == undefined) || options.asynchronous;

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

    if (options.method == undefined) {
        options.method = 'GET';
    }
    if ('post' != options.method.toLowerCase()) {
        url = [url, '?', options.parameters].join('');
        options.parameters = null;
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
    var values = {};
    Array.prototype.slice.call(form.querySelectorAll('input, textarea, select')).map(function(elm) {
        if (elm.type == 'checkbox' || elm.type == 'radio') {
            if (elm.checked) {
                values[elm.name] = elm.value;
            }
        }
        else {
            values[elm.name] = elm.value;
        }
    });
    return values;
}

/**
 * Tornado のメイン機能
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
     */
    reblog: function(post, default_postdata) {
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
                                dp['post[state]'] && Tornado.state_texts[dp['post[state]']],
                                dp['channel_id'] && dp['channel_id'] != '0' && dp['channel_id']].join(' '));
                        }
                    },
                });
            },
        });
    },
    reblogToChannelDialog: function(post, postdata) {
        var channels = $$('#user_channels > li').map(function(node) {
            return node.id.replace(/^tab-/, '');
        });

        var message = channels.map(function(str, key) {
            return [key + 1, ': ', str].join('');
        }).join('\n');

        var channel = prompt(message, 1);
        if (channel == null) {
            return;
        }

        postdata['channel_id'] = channels[parseInt(channel) - 1];
        Tornado.reblog(post, postdata);
    },
    submitPublish: function(form, onSuccess, onFailure) {
        new Ajax(form.action, {
            method: form.method,
            requestHeaders: HeaderContentType,
            parameters: buildQueryString(gatherFormValues(form)),
            onSuccess: onSuccess});
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

        /* 連続キーバインド用 */
        if (Tornado.key_input_time + Tornado.KEY_CONTINUAL_TIME < new Date()) {
            Tornado.key_follows = [];
        }
        Tornado.key_input_time = new Date() * 1;
        Tornado.key_follows = Tornado.key_follows.concat(ch).slice(-Tornado.KEY_MAX_FOLLOWS);

        post = $$('#posts>.post:not(.new_post)').filter(function(elm) {
            return vr.top == (elm.offsetTop - margin_top);
        })[0];

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
 * Tornado コマンド
 */
Tornado.commands = {
    halfdown: function() {
        var view_height = window.innerHeight;
        window.scrollBy(0, +view_height / 2);
    },
    halfup: function() {
        var view_height = window.innerHeight;
        window.scrollBy(0, -view_height / 2);
    },
    reblog: function(post) {
        Tornado.reblog(post, {});
    },
    reblogToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': '1'});
    },
    draft: function(post) {
        Tornado.reblog(post, {'post[state]': '1', 'channel_id': '0'});
    },
    queue: function(post) {
        Tornado.reblog(post, {'post[state]': '2', 'channel_id': '0'});
    },
    private: function(post) {
        Tornado.reblog(post, {'post[state]': 'private', 'channel_id': '0'});
    },
    removePosts: function(/* posts */) {
        var dsbd = document.querySelector('#posts');
        var vr = viewportRect();
        var del_count = 0;

        window.scrollTo(0, document.querySelector('#posts>.post:not(.new_post)').offsetTop - 7);

        $$('#posts > li:not(.new_post)').filter(function(post) {
            return (post.offsetTop - 7) < vr.top;
        }).map(function(post) {
            del_count++;
            dsbd.removeChild(post);
        });

        var firstpost = document.querySelector('#posts > li:not(.new_post)');
        firstpost.className = firstpost.className.replace('same_user_as_last', '');

        new PinNotification(del_count + '件のポストを削除しました。');
    },
    delete: function(post) {
        new PinNotification('Deleting... ' + post.id);

        Tornado.submitPublish(
            post.querySelector('#delete_' + post.id),
            function(_xhr) {
                new PinNotification('Deleted ' + post.id);
            },
            function(_xhr) {
                alert('fail to delete');
            });
    },
    default: function() {
        return true;  /* threw up event */
    },

};

/**
 * ショートカットを登録する部分です
 */
Tornado.shortcuts = [
    customkey('j', 'halfdown', {shift: true, usehelp: 'hide', desc: '下へ半スクロール'}),
    customkey('k', 'halfup', {shift: true, usehelp: 'hide', desc: '上へ半スクロール'}),

    customkey('t', 'reblog'),
    customkey('t', 'reblogToChannel', {follows: ['g'], desc: 'channelへリブログ'}),
    customkey('h', 'fast_reblog'),
    customkey('d', 'draft', {desc: '下書きへ送る'}),
    customkey('q', 'queue', {desc: 'キューへ送る'}),
    customkey('p', 'private'),
    customkey('d', 'delete', {has_selector: 'form[id^=delete]', usehelp: 'hide'}),

    customkey('c', 'removePosts', {shift: true, usehelp: 'hide', desc: '現在より上のポストを画面から削除します'}),
];

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
            }
        },
        ')();'].join('');
}

/**
 * スタイルシートを埋め込みます
 */
function embedStyleSheet() {
    var style_element = document.createElement('style');
    style_element.Tornado = Tornado;
    style_element.className = 'tumblr_userscript';
    style_element.appendChild(document.createTextNode(embed_css));
    document.head.appendChild(style_element);
}

/**
 * ページロード時に一度だけ呼び出されます
 */
function main() {
    var keyevent = preapply(Tornado, Tornado.keyevent);
    document.addEventListener('keydown', keyevent, false);

    embedStyleSheet();
    add_reblogged_you();
    Tornado.shortcuts.sort(function(a, b) {
        return (b.follows.length - a.follows.length) ||
               (b.has_selector.length - a.has_selector.length);
    });

    var code = [
        enhistory()].join('');
    if (/^https?:\/\/www\.tumblr\.com\/blog\/[^\/]+\/queue/.test(location)) {
        code += 'start_observing_key_commands(1);';
    }
    execClient(code, 1000);
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
