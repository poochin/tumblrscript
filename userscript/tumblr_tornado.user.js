// ==UserScript==
// @name        Tumblr Tornado
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/dashboard/*
// @match       http://www.tumblr.com/blog/*
// @version     1.0.1
// @description Tumblr にショートカットを追加するユーザスクリプト
// 
// @author      poochin
// @license     MIT
// @updated     2012-04-24
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/tumblr_tornado.user.js
// ==/UserScript==

/**
TODO List:
    * Reload (/dashboard/2/xxx を /dashboard で)
**/

/**
 * Variables
**/

var whole_css = [
    ".pin_notification.error {",
    "    color: red;",
    "}",
    ".pin_notification {",
    "    -webkit-animation: pin_notification_animation 3s forwards;",
    "    -moz-animation: pin_notification_animation 3s forwards;",
    "    -o-animation: pin_notification_animation 3s forwards;",
    "    position: fixed;",
    "    right: 15px;",
    "    bottom: 0;",
    "    margin-bottom: 10px;",
    "    padding: 5px;",
    "    min-width: 100px;",
    "    max-width: 400px;",
    "    border-radius: 5px;",
    "    border: 1px solid #888;",
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
    ".lite_dialog {",
    "  background-color: #fff;",
    "  padding: 2px;",
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
    ".lite_dialog_bar { }",
    ".lite_dialog_bar:after {",
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
    "#tornado_shortcuts_help {",
    "  color: #abb;",
    "  font-size: 12px;",
    "  line-height: 1em;",
    "}",
    "#tornado_shortcuts_help dd {",
    "  margin-left: 1em;",
    "}",
    "#tornado_shortcuts_help code {",
    "  background: #1C3752;",
    "  border-radius: 3px;",
    "}",
    "#tornado_shortcuts_help code:after {",
    "  content: ': ';",
    "  background: #2C4762;",
    "}",
].join('');

var base_lite_dialog = [
    '<div class="lite_dialog_bar">',
    '  <div class="lite_dialog_sysmenus">',
    '    <span class="lite_dialog_close">× </span>',
    '  </div>',
    '  <div class="lite_dialog_caption">',
    '  </div>',
    '</div>',
    '<div classdiv class="lite_dialog_body">',
    '</div>'].join('');

var left_click = document.createEvent("MouseEvents"); 
left_click.initEvent("click", false, true);

/**
  Library
**/

function customkey(func, options)
{
    return {
        func: func,
        url: options.url || /.*/,
        shift: options.shift || false,
        ctrl: options.ctrl || false,
        alt: options.alt || false,
        usehelp: (typeof options.usehelp == 'undefined') ? true : options.usehelp,
        desc: options.desc || '',
    };
}

function selectDialogButton(e) {
    if (document.querySelector('.lite_dialog')) {
        if (e.keyCode == 27) {
            document.querySelector('.lite_dialog_close').dispatchEvent(left_click);
        }
        else if (48 <= e.keyCode && e.keyCode <= 57) {
            var number = parseInt(e.keyCode) - '0'.charCodeAt(0);
            var name = 'button' + number;
            document.querySelector('.lite_dialog input[type="button"].' + name).focus();
        }
    }
}

function preapply(self, func, args) {
    return function() {
        func.apply(self, (args || []).concat(Array.prototype.slice.call(arguments)));
    }
}

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

function PinNotification (infomation) {
    var elm = this.elm = document.createElement('div');
    elm.className = 'pin_notification';
    elm.appendChild(document.createTextNode(infomation));
    document.body.appendChild(elm);

    setTimeout(preapply(this, function() {
        this.elm.parentNode.removeChild(this.elm);
    }), 3000);
}

function LiteDialog(title) {
    this.origin_offsetX = this.origin_offsetY = null;
    var dialog = this.dialog = document.createElement('div');
    dialog.object = dialog;

    dialog.className = 'lite_dialog';
    dialog.innerHTML = base_lite_dialog;

    var caption = dialog.querySelector('.lite_dialog_caption');
    caption.appendChild(document.createTextNode(title));
    caption.addEventListener('mousedown', preapply(this, this.mousedown));

    var close = dialog.querySelector('.lite_dialog_close');
    close.addEventListener('click', preapply(this, this.close));

    document.body.appendChild(dialog);
    this.centering(dialog);
}

LiteDialog.prototype = {
    mousedown: function(e) {
        this.mousemove = preapply(this, this.mousemove);
        this.mouseup = preapply(this, this.mouseup);
  
        document.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mouseup', this.mouseup);
  
        // memo: e.clientX, e.layerX, e.pageX, e.screenX
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
    centering: function(elm) {
        var view_info = {
            scrollTop: document.documentElement.scrollTop || document.body.scrollTop,  // FIXME: Opera OK?
            scrollLeft: document.documentElement.scrollLeft || document.body.scrollLeft,  // FIXME: Opera OK?
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
        elm.style.top = (view_info.scrollTop + (view_info.height/2) - (elm.offsetHeight/2)) + 'px';
        elm.style.left = (view_info.scrollLeft + (view_info.width/2) - (elm.offsetWidth/2)) + 'px';
    },
};


/**
 * Tornado main object
 */

var Tornado = {
    /* variables */
    prev_cursor: null,
    state_texts: {'0': '', '1': 'drafts', '2': 'queue', 'private': 'private'},
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
        // FIXME: Firefox では動かない
        Tornado.prev_cursor = post;
        window.scroll(0, document.height);
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
                var reblog_button = post.querySelector('a.reblog_button');
                if (post.querySelector('ul#errors')) {
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
                            state_text = 'to ' + Tornado.state_texts[default_postdata['post[state]']];
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
        var dialog = new LiteDialog(['Reblog', (state_text) ? ('to ' + state_text) : ('') , 'to [channel]'].join(' '));
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
        dialog.centering(dialog.dialog);
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
        Tornado.reblog(post, {'post[state]': '1'});
    },
    draftToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': '1'});
    },
    queue: function(post) {
        Tornado.reblog(post, {'post[state]': '2'});
    },
    queueToChannel: function(post) {
        Tornado.reblogToChannelDialog(post, {'post[state]': '2'});
    },
    private: function(post) {
        Tornado.reblog(post, {'post[state]': 'private'});
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
    cleanPosts: function(post) {
        /* どうにも使い勝手が悪い */
        var posts = document.querySelectorAll('#posts > .post');
        var dsbd = posts[0].parentNode;
        for (var i = 1; i < posts.length; ++i) {
            var elm = document.createElement('li');
            elm.style.cssText = [
                ';width:', posts[i].offsetWidth, 'px',
                ';height:', posts[i].offsetHeight, 'px',
                ';background:', '#fff',
                ';margin-top:', (/\bsame_user_as_last\b/.test(posts[i].className) ? 7 : 20), 'px',
                ';border-radius:', '10px'].join('');
            dsbd.replaceChild(elm, posts[i]);
            if (post == posts[i]) {
                break;
            }
        }
    },
    default: function() {
        return true;  /* threw up event */
    },

    /* Event Listener */
    keyevent: function (e) {
        var post, posts;
        var current_top, margin_top = 7;  /* J/K でpost上部に7pxのmarginが作られます */
        var operator = this.shortcuts[e.keyCode];

        current_top = document.documentElement.scrollTop || document.body.scrollTop; // FIXME: Opera OK?
        posts = document.querySelectorAll('.post');
        for (var i = 0; i < posts.length; ++i) {
            if (current_top == posts[i].offsetTop - margin_top) {
                post = posts[i];
                break;
            }
        }
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
                }
                else {
                    if (pattern.url.test(window.location) &&
                        e.shiftKey == pattern.shift &&
                        e.ctrlKey == pattern.ctrl &&
                        e.altKey == pattern.alt) {
                        if (typeof pattern.func == 'string') {
                            this[pattern.func](post);
                        }
                        else {
                            pattern.func(post);
                        }
                        break;
                    }
                }
            }
        }
        else {
            if (operator.url.test(window.location) &&
                e.shiftKey == operator.shift &&
                e.ctrlKey == operator.ctrl &&
                e.altKey == operator.alt) {
                if ((typeof operator.func) == 'string') {
                    this[operator.func](post);
                }
                else {
                    this.func(post);
                }
            }
        }
    },
};


/**
 * shortcuts info
 *
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
 * c?: cleanPosts(by SuperTumblr)
 * n: Notes
 * m?: Poster Info(with APIv2?)
 * g: got top
 * G: goto bottom
 * r?: Reload
 * O?: Jump to prev post(ability passed g, G)
 */

/**
normal
    t: reblog
    h: fast_reblog
    j: default
    k: default
    g: goTop
    l: default
    d: draft
    p: private
    i: scaleImage
    c: cleanPosts
    n: notes
shift
*/


Tornado.shortcuts = {
    /* T */ 84: [customkey('reblogToChannel', {shift: true, desc: 'channelへリブログ'}),
                 'reblog'],
    /* H */ 72: 'fast_reblog',
    /* J */ 74: [customkey('halfdown', {shift: true, desc: '下へ半スクロール'}),
                 customkey('default', {desc: '下のポストへ'})],
    /* K */ 75: [customkey('halfup', {shift: true, desc: '上へ半スクロール'}),
                 customkey('default', {desc: '上のポストへ'})],
    /* G */ 71: [customkey('goBottom', {shift: true, desc: 'スクロールを一番下へ'}),
                 customkey('goTop', {desc: 'スクロールを一番上へ'})],
    /* O */ 79: [customkey('jumpToLastCursor', {shift: true, usehelp: false})],
    /* L */ 76:  customkey('default', {desc: 'Like'}),
    /* D */ 68: [customkey('draftToChannel', {shift: true, desc: 'channelのdraftsへリブログ'}),
                 'draft'],
    /* Q */ 81: [customkey('queueToChannel', {shift: true, desc: 'channelのqueueへリブログ'}),
                 'queue'],
    /* P */ 80: [customkey('privateToChannel', {shift: true, desc: 'channelでprivateにリブログ'}),
                 'private'],
    /* I */ 73: customkey('scaleImage', {desc: '「画像・動画」を拡縮'}),
    /* C */ 67: 'cleanPosts',
    /* N */ 78: 'notes',
    // /* M */ 77: 'master'
};

/**
 * main execution functions
**/

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
        '(', inner_code, ')()'].join('');
}

function showShortcutHelp() {
    function buildShortcutHelpLine(key, shortcut) {
        var dd = document.createElement('dd');
        dd.innerHTML = [
            '<code>',
            ((typeof shortcut == 'string' || shortcut.shift == false)
                ? ('&nbsp;&nbsp;')
                : ('s-')),
            String.fromCharCode(key).toUpperCase(),
            '</code>',
            ((typeof shortcut == 'string')
                ? (shortcut)
                : (shortcut.desc || shortcut.func))].join('');
    }
    /* TODO: 内部的に重複している部分があるので分離する */
    var help = document.createElement('dl');
    help.id = 'tornado_shortcuts_help';

    var normal_shortcuts = document.createElement('dt');
    normal_shortcuts.id = 'tornado_normal_shortcuts_help';
    normal_shortcuts.appendChild(document.createTextNode('Tornado (s-はShiftを同時押し)'));
    help.appendChild(normal_shortcuts);
    for (var key in Tornado.shortcuts) {
        if (typeof Tornado.shortcuts[key] == 'string') {
            var dd = document.createElement('dd');
            dd.innerHTML = [
                '<code>&nbsp;&nbsp;', String.fromCharCode(key).toUpperCase() ,'</code>', Tornado.shortcuts[key]].join('');
            help.appendChild(dd);
        }
        else if ('length' in Tornado.shortcuts[key]) {
            var shortcuts = Tornado.shortcuts[key];
            for (var i = 0; i < shortcuts.length; ++i) {
                var shortcut = shortcuts[i];
                var dd = document.createElement('dd');
                if (typeof shortcut == 'string') {
                    var dd = document.createElement('dd');
                    dd.innerHTML = [
                        '<code>&nbsp;&nbsp;', String.fromCharCode(key).toUpperCase() ,'</code>', shortcut].join('');
                    help.appendChild(dd);
                }
                else if (shortcut.usehelp && shortcut.shift == false) {
                    var dd = document.createElement('dd');
                    dd.innerHTML = [
                        '<code>&nbsp;&nbsp;', String.fromCharCode(key).toUpperCase() ,'</code>', shortcut.desc || shortcut.func].join('');
                    help.appendChild(dd);
                }
                else if (shortcut.usehelp && shortcut.shift) {
                    var dd = document.createElement('dd');
                    dd.innerHTML = [
                        '<code>s-', String.fromCharCode(key).toUpperCase() ,'</code>', shortcut.desc || shortcut.func].join('');
                    help.appendChild(dd);
                }
            }
        }
        else if (Tornado.shortcuts[key].usehelp && Tornado.shortcuts[key].shift == false) {
            var shortcut = Tornado.shortcuts[key];
            var dd = document.createElement('dd');
            dd.innerHTML = [
                '<code>&nbsp;&nbsp;', String.fromCharCode(key).toUpperCase() ,'</code>', shortcut.desc || shortcut.func].join('');
            help.appendChild(dd);
        }
        else if (Tornado.shortcuts[key].usehelp && Tornado.shortcuts[key].shift) {
            var shortcut = Tornado.shortcuts[key];
            var dd = document.createElement('dd');
            dd.innerHTML = [
                '<code>s-', String.fromCharCode(key).toUpperCase() ,'</code>', shortcut.desc || shortcuts.func].join('');
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
    style_element.appendChild(document.createTextNode(whole_css));
    document.head.appendChild(style_element);

    showShortcutHelp();
    enhistory();

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
2012-04-23
ver 1.0.1.0
    * Google chrome, Firefox+GM, Opera に対応 *

    box-shadow, animation を複数のブラウザに対応するように記述しました。

ver 1.0.0.0
    * パイロット版を公開 *

    Google chrome 上でのみ動作するようにしています。

    Shift + Command でショートカットに拡張性をもたせやすい UserScript を目指して書きました。
    また既存の UserScript にはチャンネル投稿に対応したものが見当たらないので新しく書きました。

    autoload 時にロケーションバーに記憶させる案は Tumblr Life からいただきました。
    コピーはしていませんが、どのように書くのかはソースコードを読み勉強させてもらいました。

    cleanPosts の案は SuperTumblr からいただきました。
    ただし li.post が残るとゆくゆくコマンドの遅延が危ぶまれるため .post を class から取り除くようにしています。
    また実装部分も SuperTumblr とは違う方法を取っています。
*/
