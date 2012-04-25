// ==UserScript==
// @name        Tumblr Tornado
// @version     1.0.3
// @description Tumblr にショートカットを追加するユーザスクリプト
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/dashboard/*
// @match       http://www.tumblr.com/likes
// @match       http://www.tumblr.com/likes/*
// @match       http://www.tumblr.com/blog/*
// 
// @author      poochin
// @license     MIT
// @updated     2012-04-25
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/tumblr_tornado.user.js
// ==/UserScript==

// 追加予定(他の検索ページ等も)
// @match       http://www.tumblr.com/tagged/*

/**
TODO List:
    * Reload (/dashboard/2/xxx を /dashboard で)
**/

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
    "    margin-bottom: 8px;",
    "    padding: 5px;",
    "    min-width: 100px;",
    "    max-width: 400px;",
    "    border-radius: 5px;",
    "    border: 2px solid #888;",
    "    background: #efefef;",
    "}",
    ".pin_notification:after {",
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
    "#tornado_normal_shortcuts_help {",
    "  white-space: pre;",
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
var left_click = document.createEvent("MouseEvents"); 
left_click.initEvent("click", false, true);

var API_KEY = 'kgO5FsMlhJP7VHZzHs1UMVinIcM5XCoy8HtajIXUeo7AChoNQo';


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
 * func
 * url
 * shift
 * ctrl
 * alt
 * follows
 * usehelp
 * desc
 */
function customkey(func, options)
{
    return {
        func: func,
        url: options.url || /.*/,
        shift: options.shift || false,
        ctrl: options.ctrl || false,
        alt: options.alt || false,
        follows: options.follows || [],
        usehelp: (typeof options.usehelp == 'undefined') ? true : options.usehelp,
        desc: options.desc || ''};
}

/* keyCode と customkey が返すオブジェクトを元に一行ヘルプのテキストを作成します */
function buildShortcutLineHelp(key, shortcut) {
    var pre_spacing = ['&nbsp;', '&nbsp;', '&nbsp;'];
    var code = [
        (shortcut.follows && shortcut.follows.join(' ')) || '',
        (shortcut.shift && 's-') || '',
        (String.fromCharCode(key).toUpperCase())].join('');
    code = pre_spacing.slice(code.length).join('') + code;

    return [
        '<code>',
        code,
        '</code>',
        ((typeof shortcut == 'string')
            ? (shortcut)
            : (shortcut.desc || shortcut.func))].join('');
}

/* 数字キーが入力された際に対応したチャンネルのボタンをクリックします */
function selectDialogButton(e) {
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


/**
 * Classes
**/

/* Ajax 通信を行います */
function Ajax(method, url, params, callback, failback) {
    var xhr = this.xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                if (typeof callback != 'undefined') {
                    callback(xhr);
                }
            }
            else {
                if (typeof failback != 'undefined') {
                    failback(xhr);
                }
                else if (typeof callback != 'undefined') {
                    // failback がなくとも callback があれば呼び出します
                    callback(xhr);
                }
            }
        }
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send(buildQueryString(params));
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
    reblog_success: function() {
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
        new Ajax('GET', url_reblog, {}, preapply(window, function(default_postdata, _xhr) {
            var dummy_elm = document.createElement('div');
            var postdata = {};
            dummy_elm.innerHTML = _xhr.responseText;

            /* forms のうち有効なデータを集めます */
            var form = dummy_elm.querySelector('#content > form');
            var form_items = form.querySelectorAll('input, textarea, select');
            for (var i = 0; i < form_items.length; ++i) {
                var item = form_items[i];
                switch (item.type) {
                    case 'checkbox':
                        /* fall through */
                    case 'radio': {
                        if (item.checked) {
                            postdata[item.name] = item.value;
                        }
                        break;
                    }
                    default: {
                        postdata[item.name] = item.value;
                        break;
                    }
                }
            }
            delete postdata['preview_post'];
            for (var name in default_postdata) {
                postdata[name] = default_postdata[name];
            }

            new Ajax(form.method, form.action, postdata, function(_xhr) {
                var dummy_div = document.createElement('div');
                dummy_div.innerHTML = _xhr.responseText;

                if (dummy_div.querySelector('ul#errors')) {
                    reblog_button.innerHTML = 'NG';
                    reblog_button.className = 'reblog_button';
                    reblog_button.style.background = 'transparent';

                    new PinNotification(document.querySelector('ul#errors > li').innerHTML);
                }
                else {
                    // a.reblog_button リンクの潰し方があればそちらを試します
                    reblog_button.outerHTML = '<span>OK</span>';
                    reblog_button.className += 'reblogged';

                    if (default_postdata) {
                        var state_text = '', channel_text = '';
                        if (default_postdata['post[state]']) {
                            state_text = 'as ' + Tornado.state_texts[default_postdata['post[state]']];
                        }
                        if (default_postdata['channel_id']) {
                            channel_text = 'to ' + default_postdata['channel_id'];
                        }
                        new PinNotification(['Success: Reblogged', state_text, channel_text].join(' '));
                    }
                }
            });
        }, [default_postdata]));
    },
    reblogToChannelDialog: function(post, postdata) {
        var state_text = Tornado.state_texts[postdata["post[state]"]] || '';
        var dialog = new LiteDialog(['Reblog', (state_text) ? ('as ' + state_text) : ('') , 'to [channel]'].join(' '));
        var dialog_body = dialog.dialog.querySelector('.lite_dialog_body');
        var channel_elms = document.querySelectorAll('#all_blogs_menu .item[id] a');
        for (var i = 0; i < channel_elms.length; ++i) {
            var elm = channel_elms[i];
            var button = document.createElement('input');
            button.type = 'button';
            button.className = 'button' + (i + 1);
            button.name = elm.href.match(/[^\/]+$/)[0];
            button.value = '[' + (i + 1) + ']: ' + elm.textContent.trim();  // FIXME: Opera OK?
            var button_click = function(e) {
                postdata.channel_id = this.name;
                Tornado.reblog(post, postdata);
                dialog.close();
            };
            button.addEventListener('click', button_click);
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

        new Ajax('GET', url_fast_reblog, {}, function(xhr) {
            if (xhr.responseText == 'OK') {
                reblog_button.outerHTML = '<span>OK</span>';
            }
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
            if (navigator.appVersion.search('Chrome') >= 0) {
                /* FIXME: Firefox / Opera でもう一度、こちらで動かないか確認 */
                with({elm: post.querySelector('img.image_thumbnail') ||
                           document.querySelector('#tumblr_lightbox') ||
                           post.querySelector('a.photoset_photo')}) {
                    elm.dispatchEvent(left_click);
                }
            }   
            else {
                // Firefox: onclick of attr can't be launched by dispatchEvent
                if (post.querySelector('img.image_thumbnail')) {
                    post.querySelector('img.image_thumbnail').dispatchEvent(left_click);
                }   
                else if (post.querySelector('a.photoset_photo')) {
                    with({elm: document.querySelector('#tumblr_lightbox') ||
                               post.querySelector('a.photoset_photo')}) {
                        elm.dispatchEvent(left_click);
                    }
                }
            }   
        }   
        else if (type == 'video') {
            if (navigator.appVersion.search('Chrome') >= 0) {
                var video = post.querySelector('.video_thumbnail');
                video.dispatchEvent(left_click);
            }
            else {
                var video = post.querySelector('.video_thumbnail');
                video.click();
            }
        }   
    },
    cleanPosts: function(/* post */) {
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
    rootInfo: function(post) {
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
        var blog_name = permalink.match(/[^\/]*(?=\/post)/)[0];
        var qs = buildQueryString({id: post_id , jsonp: 'jsonpRootInfo', reblog_info: 'true', api_key: API_KEY});
        var url = [
            'http://api.tumblr.com/v2/blog',
            blog_name,
            'posts?' + qs].join('/');
        script.src = url;

        document.body.appendChild(script);
    },
    default: function() {
        return true;  /* threw up event */
    },

    /* Event Listener */
    keyevent: function (e) {
        // FIXME: 長すぎるので分割する
        function event_char(e) {
            var c = String.fromCharCode(e.keyCode);
            return (e.shiftKey ? c.toUpperCase() : c.toLowerCase());
        }

        var post, posts;
        var current_top, margin_top = 7;  /* J/K でpost上部に7pxのmarginが作られます */
        var operator = this.shortcuts[e.keyCode];

        var key_code = e.keyCode;
        if (65 <= key_code && key_code <= 90) {
            // 65 == 'A', 90 == 'Z'
            var time = (new Date()) * 1;
            if (Tornado.key_input_time + Tornado.KEY_CONTINUAL_TIME < time) {
                Tornado.key_follows = [];
            }
            Tornado.key_follows = Tornado.key_follows.concat(event_char(e));
            Tornado.key_follows = Tornado.key_follows.splice(-Tornado.KEY_MAX_FOLLOWS);
            Tornado.key_input_time = time;
        }

        if (!operator) {
            return;
        }

        current_top = document.documentElement.scrollTop || document.body.scrollTop;
        post = Array.prototype.slice.call(document.querySelectorAll('.post')).filter(function(elm) {
            return current_top == (elm.offsetTop - margin_top);
        })[0];
        if (!post) {
            console.log('Post not found');
        }

        /* execute Tornado Event */
        if (typeof operator == 'string') {
            if ((e.shiftKey || e.ctrlKey || e.altKey) == false) {
                this[operator](post);
            }
        }
        else if (typeof operator == 'object' && 'length' in operator) {
            var patterns = operator;
            for (var i = 0; i < patterns.length; ++i) {
                var pattern = patterns[i];
                if (typeof pattern == 'string') {
                    this[pattern](post);
                    Tornado.key_follows = [];
                }
                else {
                    if (pattern.url.test(window.location) &&
                        e.shiftKey == pattern.shift &&
                        e.ctrlKey == pattern.ctrl &&
                        e.altKey == pattern.alt) {

                        if (pattern.follows &&
                            pattern.follows.length &&
                            !Tornado.key_follows.cmp(pattern.follows.concat(event_char(e)))) {
                        }
                        else {
                            if (typeof pattern.func == 'string') {
                                this[pattern.func](post);
                            }
                            else {
                                pattern.func(post);
                            }
                            Tornado.key_follows = [];
                            break;
                        }
                    }
                }
            }
        }
        else {
            if (operator.url.test(window.location) &&
                e.shiftKey == operator.shift &&
                e.ctrlKey == operator.ctrl &&
                e.altKey == operator.alt) {

                if (operator.follows &&
                    operator.follows.length &&
                    !Tornado.key_follows.cmp(operator.follows.concat(event_char(e)))) {
                }
                else {
                    if ((typeof operator.func) == 'string') {
                        this[operator.func](post);
                    }
                    else {
                        this.func(post);
                    }

                    Tornado.key_follows = [];
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

Tornado.shortcuts = {
    /* T */ 84: [customkey('reblogToChannel', {shift: true, desc: 'channelへリブログ'}),
                 'reblog'],
    /* H */ 72: 'fast_reblog',
    /* J */ 74: [customkey('halfdown', {shift: true, desc: '下へ半スクロール'}),
                 customkey('default', {desc: '次ポストへ移動'})],
    /* K */ 75: [customkey('halfup', {shift: true, desc: '上へ半スクロール'}),
                 customkey('default', {desc: '前ポストへ移動'})],
    /* G */ 71: [customkey('goBottom', {shift: true, desc: '一番下へスクロール'}),
                 customkey('goTop', {follows: ['g'], desc: '一番上へスクロール'})],
    /* O */ 79: [customkey('jumpToLastCursor', {shift: true, usehelp: false})],
    /* L */ 76:  customkey('default', {desc: 'Like'}),
    /* D */ 68: [customkey('draftToChannel', {follows: ['g'], desc: '下書きとしてchannelへ保存'}),
                 'draft'],
    /* Q */ 81: [customkey('queueToChannel', {follows: ['g'], desc: 'queueとしてchannelへ保存'}),
                 'queue'],
    /* P */ 80: [customkey('privateToChannel', {follows: ['g'], desc: 'privateとしてchannelへリブログ'}),
                 'private'],
    /* I */ 73: customkey('scaleImage', {desc: '"photo","video"を拡縮'}),
    /* C */ 67: customkey('cleanPosts', {desc: '現在より上のポストを空の状態にする'}),
    /* N */ 78: customkey('notes', {desc: 'Notes を表示'}),
    /* M */ 77: 'rootInfo'
};

/**
 * main execution functions
**/

/* rootInfo の jsonp を処理する関数をページに埋め込みます */
function embedRootInfo() {
    function jsonpRootInfo(json) {
        var post = json.response.posts[0];
        var node_post = document.querySelector('#post_' + post.id);
        var root_info = node_post.querySelector('.root_info');
        var root_name = post.reblogged_root_name;
        var root_url = post.reblogged_root_url;

        var text_root_link = (root_name ? (['<a herf="', root_url, '">', root_name, '</a>'].join('')) : 'missing');

        root_info.innerHTML = ' [' + text_root_link + ']';

        var script = document.querySelector('#showroot_' + post.id);
        script.parentNode.removeChild(script);
    }
    var jsonpRootInfo = jsonpRootInfo.toString();
    window.location = [
        'javascript:',
        jsonpRootInfo].join('');
}

/* オートロードするたびにURLを現在のページに置き換える処理をページに埋め込みます */
function enhistory() {
    var inner_code = (function() {
        var papr = window._process_auto_paginator_response;
        window._process_auto_paginator_response = function(transport) {
            history.pushState('', '', window.next_page);
            papr(transport);
        }
    }).toString();
    window.location.href = [
        'javascript:',
        '(',
        inner_code,
        ')()'].join('');
}

/* right column に各ショートカットのヘルプを表示します */
function showShortcutHelp() {
    var help = document.createElement('dl');
    help.id = 'tornado_shortcuts_help';

    var normal_shortcuts = document.createElement('dt');
    normal_shortcuts.id = 'tornado_normal_shortcuts_help';
    normal_shortcuts.appendChild(document.createTextNode([
        'Tumblr Tornado',
        '* s-はShift同時押し',
        '* 小文字は連続入力'].join('\n')));
    help.appendChild(normal_shortcuts);

    for (var key in Tornado.shortcuts) {
        var shortcuts = Tornado.shortcuts[key];
        if (typeof shortcuts == 'string') {
            var dd = document.createElement('dd');
            dd.innerHTML = buildShortcutLineHelp(key, shortcuts);
            help.appendChild(dd);
        }
        else if ('length' in shortcuts) {
            for (var i = 0; i < shortcuts.length; ++i) {
                var shortcut = shortcuts[i];
                var dd = document.createElement('dd');
                dd.innerHTML = buildShortcutLineHelp(key, shortcut);
                help.appendChild(dd);
            }
        }
        else if (shortcuts.usehelp && !shortcuts.shift) {
            var dd = document.createElement('dd');
            dd.innerHTML = buildShortcutLineHelp(key, shortcuts);
            help.appendChild(dd);
        }
        else if (shortcuts.usehelp && shortcuts.shift) {
            var dd = document.createElement('dd');
            dd.innerHTML = buildShortcutLineHelp(key, shortcuts);
            help.appendChild(dd);
        }
    }
    document.querySelector('#right_column').appendChild(help);
}


/**
 * main
**/

function main() {
    var keyevent = preapply(Tornado, Tornado.keyevent);
    document.addEventListener('keydown', keyevent, false);
    document.addEventListener('keydown', selectDialogButton, true);

    var style_element = document.createElement('style');
    style_element.appendChild(document.createTextNode(embed_css));
    document.head.appendChild(style_element);

    showShortcutHelp();
    enhistory();
    embedRootInfo();

    style_element.Tornado = Tornado;
}

if (window.document.body) {
    main();
}
else {
    window.document.addEventListener('DOMContentLoaded', main, false);
}


/**
 * History
**/
/*
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
