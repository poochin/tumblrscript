// ==UserScript==
// @name        Tumblr Tornado
// @version     1.0.9
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
// @updated     2012-05-02
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/tumblr_tornado.user.js
// ==/UserScript==


/**
TODO List:
    /reblog, /edit, /new の部分で channel_id や state の選択をボタンで選べるように、とか

    // show/videos などのオートロードに対応する

    // pub, que, del 中の css 変化を考える
    // pub, que, del したものに className += 各付けます
    
    // s-N で show more notes をクリックする
**/


/* escaping global scope poisoning */
(function () {

/**
 * Variables
**/

/* ページに埋め込むスタイルシート */
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
    /* Reblog Button */
    ".reblog_button.reblogging {",
    "    background-position: -530px -270px !important;",
    "    -webkit-animation: reblogging 1s infinite;",
    "    -moz-animation: reblogging 1s infinite;",
    "    -o-animation: reblogging 1s infinite;",
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
    "@keyframes reblogging {",
    "  0% { -o-transform: rotate(0deg) scale(1.5, 1.5); }",
    "  25% { -o-transform: rotate(360deg) scale(1, 1); }",
    "  40% { -o-transform: rotate(360deg) scale(1, 1); }",
    "  50% { -o-transform: rotate(360deg) scale(1.1, 1.1); }",
    "  55% { -o-transform: rotate(360deg) scale(1, 1); }",
    "  100% { -o-transform: rotate(360deg) scale(1, 1); }",
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

/* dispatch 用の左クリックイベント */
var left_click = document.createEvent("MouseEvent"); 
left_click.initEvent("click", false, true);

/* root info を取得するのに使います */
var API_KEY = 'kgO5FsMlhJP7VHZzHs1UMVinIcM5XCoy8HtajIXUeo7AChoNQo';

/* Reblog 時 Content Type を指定する用の配列です */
var HeaderContentType = ["Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"];

/**
 * Type Extention
**/

Array.prototype.cmp = function(another) {
    if (this.length != another.length) {
        return false;
    }

    for (var i = 0; i < this.length; ++i) {
        if (this[i] != another[i]) {
            return false;
        }
    }
    return true;
};


/**
 * Library
**/

/* Tumblr/script を元に UserScript から動かせるように取り込みました */
function toggleVideoEmbed(post) {
    var post_id = post.id.match(/\d+/)[0];
    var toggle = post.querySelector('.video_thumbnail');
    var embed = post.querySelector('.video_embed');
    var watch = post.querySelector('.video');
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

/* */
function createDummyNode(html) {
    // TODO* document.createRange を用いる
    var node = document.createElement('div');
    node.innerHTML = html;
    return node;
}

/* document.querySelectorAll */
function $$(selector)
{
    return document.querySelectorAll(selector);
}


/* 一度の処理で一度の javascript コードを location に指定できない為、遅延させて実行させます */
function execClient(code, lazy)
{
    lazy = (typeof lazy == 'undefined' ? 0 : lazy);
    setTimeout(function() {location.assign('javascript:' + code)}, lazy)
}

/* クライントエリアの位置・サイズを返します */
function viewRect()
{
    return {
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
        cx: document.documentElement.clientWidth,
        cy: document.documentElement.clientHeight};
}

/* 要素の位置・サイズを返します */
// FIXME: absolute, fixed などは static, relative 親要素になるまで再帰的に取る必要があります
function nodeRect (elm)
{
    return {
        'x': elm.offsetLeft,
        'y': elm.offsetTop,
        'cx': elm.offsetWidth,
        'cy': elm.offsetHeight};
};

/* キーイベント用のオブジェクトを生成して返します */
/**
 * match
 * func
 * follows
 * has_selector
 * url
 * shift
 * ctrl
 * alt
 * usehelp
 * desc
 */
function customkey(match, func, options)
{
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

/* keyCode と customkey が返すオブジェクトを元に一行ヘルプのテキストを作成します */
function buildShortcutLineHelp(shortcut) {
    var pre_spacing = ['&nbsp;', '&nbsp;', '&nbsp;'];
    var code = [
        (shortcut.follows && shortcut.follows.join(' ')) || '',
        (shortcut.shift && 's-') || '',
        shortcut.match.toUpperCase()].join('');
    code = pre_spacing.slice(code.length).join('') + code;

    // FIXME: 読みづらい
    return [
        '<code>',
        code,
        '</code>',
        ((typeof shortcut == 'string')
            ? (shortcut)
            : (shortcut.desc || shortcut.func))].join('');
}

/* self が func を呼び出した事にします */
function preapply(self, func, args) {
    return function() {
        func.apply(self, (args || []).concat(Array.prototype.slice.call(arguments)));
    };
}

/* {}オブジェクトから HTTP 送信クエリストリングを作成します */
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

/* ... */
function buildElementFromHTML(html) {
    // TODO* document.createRange を用いる
    
}


/**
 * Classes
**/

function Ajax(url, options) {
    var xhr = this.xhr = new XMLHttpRequest();
    var async = (options.asynchronous == undefined) || options.asynchronous;

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                if (options.onSuccess) {
                    options.onSuccess(xhr);
                }
            }
            else {
                // FIXME: エラーを具体的に分ける
                if (options.onFailure) {
                    options.onFailure(xhr);
                }
            }
            if (options.onComplete) {
                options.onComplete(xhr);
            }
        }
    }

    xhr.open(options.method, url, async);
    for (var i = 0; options.requestHeaders && i < options.requestHeaders.length; i+=2) {
        xhr.setRequestHeader(options.requestHeaders[i], options.requestHeaders[i+1]);
    }
    xhr.send(options.parameters);
}


/* クライアントエリアの右下にピンバルーンとメッセージを表示します */
function PinNotification (message) {
    var board = document.querySelector('#pin_notification_board');
    if (!board) {
        board = document.createElement('div');
        board.id = 'pin_notification_board';
        document.body.appendChild(board);
    }

    var elm = this.elm = document.createElement('div');
    elm.className = 'pin_notification';
    elm.appendChild(document.createTextNode(message));

    board.appendChild(elm);

    setTimeout(preapply(this, function() {
        this.elm.parentNode.removeChild(this.elm);
    }), 3000);
}


/* 軽量 Dialog ボックスを作成します */
function LiteDialog(title) {
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

LiteDialog.prototype = {
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
    mousedown: function(e) {
        this.mousemove = preapply(this, this.mousemove);
        this.mouseup = preapply(this, this.mouseup);
  
        document.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mouseup', this.mouseup);
  
        this.origin_offsetX = e.clientX - this.dialog.offsetLeft;
        this.origin_offsetY = e.clientY - this.dialog.offsetTop;
    },
    mousemove: function(e) {
        this.dialog.style.top = (e.clientY - this.origin_offsetY) + 'px';
        this.dialog.style.left = (e.clientX - this.origin_offsetX) + 'px';
        window.getSelection().removeAllRanges();
    },
    mouseup: function(e) {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mousemove', this.mouseup);
    },
    close: function(e) {
        this.dialog.parentNode.removeChild(this.dialog);
        this.dialog = undefined;
    },
    keyevent: function (e) {
        /* 数字キーが入力された際に対応したチャンネルのボタンをクリックします */
        if (document.querySelector('.lite_dialog')) {
            if (e.keyCode == 27) {
                document.querySelector('.lite_dialog_close').dispatchEvent(left_click);
            }
            else if (48 <= e.keyCode && e.keyCode <= 57) {
                var number = parseInt(e.keyCode) - '0'.charCodeAt(0);
                var name = 'button' + number;
                document.querySelector('.lite_dialog input[type="button"].' + name).click();
            }
        }
    },
    centering: function() {
        var elm = this.dialog;
        var vr = viewRect();
        elm.style.top = (vr.y + (vr.cy / 2) - (elm.offsetHeight / 2)) + 'px';
        elm.style.left = (vr.x + (vr.cx / 2) - (elm.offsetWidth / 2)) + 'px';
    },
};


/**
 * Tornado main object
**/

var Tornado = {
    /* const */
    KEY_MAX_FOLLOWS: 2,
    KEY_CONTINUAL_TIME: 2000, // milli

    /* variables */
    prev_cursor: null,
    state_texts: {'0': '', '1': 'drafts', '2': 'queue', 'private': 'private'},
    key_input_time: 0,  // 前回入力した時刻
    key_follows: [],

    /* shortcuts */
    downPost: undefined,
    halfdown: function() {
        var view_height = window.innerHeight;
        window.scrollBy(0, +view_height / 2);
    },
    upPost: undefined,
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
    like: undefined,
    reblog_success: function(post, postdata) {
        // 使用しないかも知れない
    },
    reblog_fail: function() {
        // 使用しないかも知れない
    },
    reblog: function(post, default_postdata) {
        var reblog_button = post.querySelector('a.reblog_button');
        reblog_button.className += ' reblogging';

        if (!default_postdata) {
            default_postdata = {};
        }

        var url_reblog = post.querySelector('.reblog_button').href;
        new Ajax(url_reblog, {
            method: 'GET',
            onSuccess: preapply(window, function(_xhr) {
                var dummy_elm = createDummyNode(_xhr.responseText);
    
                /* forms のうち有効なデータを集めます */
                var postdata = {};
                var form = dummy_elm.querySelector('#content > form');
                var form_items = form.querySelectorAll('input, textarea, select');
                Array.prototype.slice.call(form_items).map(function(elm) {
                    if (elm.type == 'checkbox' || elm.type == 'radio') {
                        if (elm.checked) {
                            postdata[elm.name] = elm.value;
                        }
                    }
                    else {
                        postdata[elm.name] = elm.value;
                    }
                });
                delete postdata['preview_post'];
                for (var name in default_postdata) {
                    postdata[name] = default_postdata[name];
                }

                new Ajax(form.action, {
                    method: form.method,
                    parameters: buildQueryString(postdata),
                    requestHeaders: HeaderContentType,
                    onSuccess: function(_xhr) {
                        var dummy_div = createDummyNode(_xhr.responseText);

                        if (dummy_div.querySelector('ul#errors')) {
                            reblog_button.className = reblog_button.className.replace('reblogging', '');
                            alert(dummy_div.querySelector('ul#errors').textContent.trim());
                        }
                        else {
                            reblog_button.outerHTML = '<span>OK</span>';
                            reblog_button.className += 'reblogged';

                            if (default_postdata) {
                                var state_text = '', channel_text = '';
                                if (default_postdata['post[state]']) {
                                    state_text = 'as ' + Tornado.state_texts[default_postdata['post[state]']];
                                }
                                if (default_postdata['channel_id'] && default_postdata['channel_id'] != '0') {
                                    channel_text = 'to ' + default_postdata['channel_id'];
                                }
                                new PinNotification(['Success: Reblogged', state_text, channel_text].join(' '));
                            }
                        }
                    },
                });
            }),
        });
    },
    reblogToChannelDialog: function(post, postdata) {
        function createChannelButton(channel_id, channel_title, number) {
            var button = document.createElement('input');
            button.type = 'button';
            button.className = 'button' + number;
            button.name = channel_id;
            button.value = '[' + number + ']: ' + channel_title;
            return button;
        }

        var state_text = Tornado.state_texts[postdata["post[state]"]] || '';
        var dialog = new LiteDialog(['Reblog', (state_text) ? ('as ' + state_text) : ('') , 'to [channel]'].join(' '));
        var dialog_body = dialog.dialog.querySelector('.lite_dialog_body');
        var channel_elms = document.querySelectorAll('#all_blogs_menu .item[id] a');

        for (var i = 0; i < channel_elms.length; ++i) {
            var elm = channel_elms[i];
            var button = createChannelButton(elm.href.match(/[^\/]+$/)[0], elm.textContent.trim(), i + 1);
            button.addEventListener('click', function(e) {
                postdata.channel_id = this.name;
                Tornado.reblog(post, postdata);
                dialog.close();
            });

            dialog_body.appendChild(button);
        }

        dialog.dialog.style.top = (post.offsetTop + 37) + 'px';
        dialog.dialog.style.left = (post.offsetLeft + 20) + 'px';

        dialog_body.querySelector('input[type="button"]').focus();
    },
    fast_reblog: function(post) {
        var reblog_button = post.querySelector('a.reblog_button');
        var url_fast_reblog = reblog_button.getAttribute('data-fast-reblog-url');
        reblog_button.className += ' reblogging';

        new Ajax(url_fast_reblog, {
            method: 'GET',
            onSuccess: function(_xhr) {
                reblog_button.outerHTML = '<span>OK</span>';
                new PinNotification('Reblogged');
            },
            onFailure: function(_xhr) {
                alert('Error: ' + _xhr.responseText);
                reblog_button.className = reblog_button.className.replace('reblogging', '');
            },
        });
    },
    reblogToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {});
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
    notes: function(post) {
        var notes_link = post.querySelector('.reblog_count');
        notes_link.dispatchEvent(left_click);  // TODO: Firefox OK?

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
        // TODO: .notification の clean を実装する
        var posts = document.querySelectorAll('#posts > .post:not([class~="new_post"])');
        var dsbd = posts[0].parentNode;
        var vr = viewRect();
        var i;
        for (i = 0; posts[i].offsetTop < vr.y && i < posts.length; ++i) {
            var post = document.createElement('li');
            post.className = ['empty_post', posts[i].className.match(/\bsame_user_as_last\b/)].join(' ');
            post.style.cssText = [
                'width:', posts[i].offsetWidth, 'px;',
                'height:', posts[i].offsetHeight, 'px;'].join('');
            dsbd.replaceChild(post, posts[i]);
        }
        new PinNotification(i + '件のポストを空にしました。');
    },
    removePosts: function(/* posts */) {
        var posts = document.querySelectorAll('#posts > .post:not([class~="new_post"]), #posts > .notification, #posts > .empty_post');
        var dsbd = posts[0].parentNode;
        var vr = viewRect();
        var i, del_count = 0;

        window.scrollTo(0, posts[0].offsetTop - 7);

        for (i = 0; i < posts.length && (posts[i].offsetTop - 7) < vr.y; ++i) {
        }
        del_count = i;
        for (i = i - 1; i >= 0; --i) {
            dsbd.removeChild(posts[i]);
        }

        posts[del_count].className = posts[del_count].className.replace('same_user_as_last', '');
        new PinNotification(del_count + '件のポストを削除しました。');
    },
    rootInfo: function(post) {
        // FIXME: "rebloged you:" に対応していません
        // FIXME: private ポストの情報の取得に対応していません
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
    delete: function(post) {
        var delete_button = post.querySelector('a[onclick^="if (confirm(\'D"]');
        delete_button.innerHTML = 'Deleting...';

        var id = post.id.match(/\d+/)[0];
        var form_key = post.querySelector('form[id^=delete] input[name=form_key]').value;

        new Ajax('/delete', {
            method: 'post',
            parameters: buildQueryString({id: id, form_key: form_key}),
            requestHeaders: HeaderContentType,
            onSuccess: function(_xhr) {
                delete_button.innerHTML = 'Deleted!';
                new PinNotification('Post [' + id + '] deleted.');
            },
            onFailure: function(_xhr) {
                delete_button.innerHTML = 'delete';
                alert('fail to delete');
            },
        });
    },
    publish: function(post) {
        var publish_button = post.querySelector('a[onclick^="if (confirm(\'P"]');
        publish_button.innerHTML = 'Publishing...';

        var id = post.id.match(/\d+/)[0];
        var form_key = post.querySelector('form[id^=publish] input[name=form_key]').value;

        new Ajax('/publish', {
            method: 'post',
            parameters: buildQueryString({id: id, form_key: form_key}),
            requestHeaders: HeaderContentType,
            onSuccess: function(_xhr) {
                delete_button.innerHTML = 'Published!';
                new PinNotification('Post [' + id + '] Published.');
            },
            onFailure: function(_xhr) {
                publish_button.innerHTML = 'publish';
                alert('fail to publish');
            },
        });
    },
    enqueue: function(post) {
        var queue_button = post.querySelector('a[onclick^="if (confirm(\'Q"]');
        queue_button.innerHTML = 'Enqueueing...';

        var id = post.id.match(/\d+/)[0];
        var form_key = post.querySelector('form[id^=queue] input[name=form_key]').value;

        new Ajax('/publish', {
            method: 'post',
            parameters: buildQueryString({id: id, form_key: form_key, queue: 'queue'}),
            requestHeaders: HeaderContentType,
            onSuccess: function(_xhr) {
                delete_button.innerHTML = 'Enqueued!';
                new PinNotification('Post [' + id + '] enqueue.');
            },
            onFailure: function(_xhr) {
                queue_button.innerHTML = 'queue';
                alert('fail to enqueue');
            },
        });
    },
    default: function() {
        return true;  /* threw up event */
    },

    /* Event Listener */
    keyevent: function (e) {
        var post, posts;
        var current_top, margin_top = 7;  /* J/K でpost上部に7pxのmarginが作られます */

        var key_char = String.fromCharCode(e.keyCode);
        key_char = (e.shiftKey ? key_char.toUpperCase() : key_char.toLowerCase());

        if (112 <= e.keyCode && e.keyCode <= 123) {
            /* Function keys */
            return;
        }

        if (65 <= e.keyCode && e.keyCode <= 90) {
            // 65 == 'A', 90 == 'Z'
            var time = (new Date()) * 1;
            if (Tornado.key_input_time + Tornado.KEY_CONTINUAL_TIME < time) {
                Tornado.key_follows = [];
            }
            Tornado.key_input_time = time;

            Tornado.key_follows = Tornado.key_follows.concat(key_char).slice(-Tornado.KEY_MAX_FOLLOWS);
        }

        var vr = viewRect();
        post = Array.prototype.slice.call($$('.post')).filter(function(elm) {
            return vr.y == (nodeRect(elm).y - margin_top);
        })[0];
        if (!post) {
            console.log('Post not found');
        }

        var shortcuts = Tornado.shortcuts.slice(0);
        shortcuts.sort(function(a, b) {
            return (b.follows.length - a.follows.length) ||
                   (b.has_selector.length - a.has_selector.length);
        });

        for (var i = 0; i < shortcuts.length; ++i) {
            var shortcut = shortcuts[i];
            if (shortcut.url.test(location) &&
                key_char.toLowerCase() == shortcut.match &&
                e.shiftKey == shortcut.shift &&
                e.ctrlKey == shortcut.ctrl &&
                e.altKey == shortcut.alt) {

                if (shortcut.has_selector &&
                    !post.querySelector(shortcut.has_selector)) {
                    continue;
                }

                if (shortcut.follows &&
                    shortcut.follows.length &&
                    !Tornado.key_follows.cmp(shortcut.follows.concat(shortcut.match))) {
                    continue;
                    // FIXME: shortcut.match.toUpperCase, toLowerCase()
                }
                else {
                    if (typeof shortcut.func == 'string') {
                        this[shortcut.func](post);
                    }
                    else {
                        shortcut.func(post);
                    }
                    Tornado.key_follows = [];
                    break;
                }
            }
        }
    },
};


/**
 * shortcuts info *

 * h: fastReblog
 * t: ReblogNormally
 * j: Down
 * J: halfDown
 * k: Up
 * K: halfUp
 * l: Like
 * d: Drafts, (delete?)
 * q: Queue
 * p: Private, (publish?)
 * i: scaleImage
 * c: cleanPosts(by SuperTumblr)
 * n: Notes
 * m?: Poster Info(with APIv2?)
 * g: got top
 * G: goto bottom
 * r?: Reload
 * O: Jump to prev post(ability passed g, G)
 */

Tornado.shortcuts = [
    customkey('j', 'default', {desc: '次ポストへ移動'}),
    customkey('j', 'halfdown', {shift: true, usehelp: 'hide', desc: '下へ半スクロール'}),

    customkey('k', 'default', {desc: '前ポストへ移動'}),
    customkey('k', 'halfup', {shift: true, usehelp: 'hide', desc: '上へ半スクロール'}),

    customkey('l', 'default', {desc: 'Like'}),

    customkey('g', 'goBottom', {shift: true, usehelp: 'hide', desc: '一番下へスクロール'}),
    customkey('g', 'goTop', {follows: ['g'], usehelp: 'hide', desc: '一番上へスクロール'}),

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

    customkey('c', 'cleanPosts', {usehelp: 'hide', desc: '現在より上のポストを空の状態にする'}),
    customkey('c', 'removePosts', {shift: true, usehelp: 'hide', desc: '現在より上のポストを画面から削除します'}),

    customkey('n', 'notes', {usehelp: 'hide', desc: 'Notes を表示'}),
    customkey('r', 'topReload', {shift: true, usehelp: 'hide'}),
    customkey('o', 'jumpToLastCursor', {shift: true, usehelp: false}),

    customkey('d', 'delete', {has_selector: 'form[id^=delete]', usehelp: 'hide'}),
    customkey('p', 'publish', {has_selector: 'form[id^=publish]', usehelp: 'hide'}),
    customkey('q', 'enqueue', {has_selector: 'form[id^=queue]', usehelp: 'hide'}),
];


/**
 * main execution functions
**/

/* 無効になっているデフォルトのショートカットキーを有効にします */
function wakeupDefaultShortcut() {
    execClient('start_observing_key_commands(1);', 1000);
}

/* rootInfo の jsonp を処理する関数をページに埋め込みます */
function embedRootInfo() {
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
    execClient(jsonpRootInfo.toString(), 300);
}

/* オートロードするたびにURLを現在のページに置き換える処理をページに埋め込みます */
function enhistory() {
    // /show/text,
    var inner_code = (function() {
        var papr = window._process_auto_paginator_response;
        window._process_auto_paginator_response = function(transport) {
            history.pushState('', '', window.next_page);
            papr(transport);
        }
    }).toString();
    execClient('(' + inner_code + ')()', 0);
}

/* right column に各ショートカットのヘルプを表示します */
function showShortcutHelp() {
    var help = document.createElement('dl');
    help.id = 'tornado_shortcuts_help';

    var normal_shortcuts = document.createElement('dt');
    normal_shortcuts.id = 'tornado_normal_shortcuts_help';
    normal_shortcuts.innerHTML = [
        'Tumblr Tornado <span class="more">[もっと見る]</span>',
        '<span class="hide">* s-はShift同時押し',
        '* 小文字は連続入力</span>'].join('<br />');
    help.appendChild(normal_shortcuts);

    normal_shortcuts.querySelector('span').addEventListener('click', function(e) {
        var hides = document.querySelectorAll('#tornado_shortcuts_help .hide');
        hides = Array.prototype.slice.call(hides);
        hides.map(function(elm) {
            elm.className = '';
        });
        this.parentNode.removeChild(this);
    });

    for (var i = 0; i < Tornado.shortcuts.length; ++i) {
        var shortcut = Tornado.shortcuts[i];
        var dd = document.createElement('dd');
        if (!shortcut.usehelp) {
            continue;
        }
        if (shortcut.usehelp == 'hide') {
            dd.className = 'hide';
        }
        dd.innerHTML = buildShortcutLineHelp(shortcut);
        help.appendChild(dd);
    }
    document.querySelector('#right_column').appendChild(help);
}

/**
 * main
**/

function main() {
    var keyevent = preapply(Tornado, Tornado.keyevent);
    document.addEventListener('keydown', keyevent, false);

    var style_element = document.createElement('style');
    style_element.appendChild(document.createTextNode(embed_css));
    document.head.appendChild(style_element);

    showShortcutHelp();
    enhistory();
    embedRootInfo();

    if (/^https?:\/\/www\.tumblr\.com\/blog\/[^\/]+\/queue/.test(location)) {
        wakeupDefaultShortcut();
    }

    style_element.Tornado = Tornado;
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
/* escaping global scope poisoning */



/**
 * History
**/
/*
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
