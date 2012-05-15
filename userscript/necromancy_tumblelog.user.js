// ==UserScript==
// @name        Necromancy Tumblelog
// @match       http://www.tumblr.com/blog/*
// @version     1.0.0
// @description 他人の tumblelog を自分の blog ページの様に表示させます
//
// @author      poochin
// @license     MIT
// @updated     2012-05-15
// @namespace   NecromancyTumblelog
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/necromancy_tumblelog.user.js
// ==/UserScript==

// TODO: ランダム機能を付けます
// TODO: 分類ごとにオブジェクトにします
// TODO: quote body の h2 などを取り除きます

/**
 * @namespace NecromancyTumblelog
 */
((function NecromancyTumblelog() {

var API_KEY = 'lu2Ix2DNWK19smIYlTSLCFopt2YDGPMiESEzoN2yPhUSKbYlpV';
var PATH_PARSER = /\/blog\/(?:([a-z\-_.]+)\/?)(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+)\/?)?$/;
var LOAD_SCROLL_OFFSET = 5000;

// FIXME: font タグの除去方法

/**
 * オブジェクトをシリアライズします
 * http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
 * @param {Object} _obj 辞書型のオブジェクト.
 * @return {String} eval で復元できるシリアライズした文字列を返します.
 */
function serialize(_obj)
{
   // Let Gecko browsers do this the easy way
   if (typeof _obj.toSource !== 'undefined' && typeof _obj.callee === 'undefined')
   {
      return _obj.toSource();
   }
   // Other browsers must do it the hard way
   switch (typeof _obj)
   {
      // numbers, booleans, and functions are trivial:
      // just return the object itself since its default .toString()
      // gives us exactly what we want
      case 'number':
      case 'boolean':
      case 'function':
         return _obj;
         break;

      // for JSON format, strings need to be wrapped in quotes
      case 'string':
         return '\'' + _obj.replace("'", "\'") + '\'';
         break;

      case 'object':
         var str;
         if (_obj.constructor === Array || typeof _obj.callee !== 'undefined')
         {
            str = '[';
            var i, len = _obj.length;
            for (i = 0; i < len - 1; i++) { str += serialize(_obj[i]) + ','; }
            str += serialize(_obj[i]) + ']';
         }
         else
         {
            str = '{';
            var key;
            for (key in _obj) { str += key + ':' + serialize(_obj[key]) + ','; }
            str = str.replace(/\,$/, '') + '}';
         }
         return str;
         break;

      default:
         return 'UNKNOWN';
         break;
   }
}

/**
 * クライアントページでコードを実行します。
 * @param {String} code 実行したいコード(// 行コメントは含めないでください).
 * @param {Number} lazy ミリ秒単位での遅延実行する時間。 デフォルトは 0 です.
 */
function execClient(code, lazy) {
    lazy = (typeof lazy == 'undefined' ? 0 : lazy);
    setTimeout(function() {location.assign('javascript:' + code)}, lazy);
}


/**
 * 辞書型オブジェクトから HTTP クエリ文字列を作成します。
 * @param {Object} dict key, value 対応のクエリ文字列.
 * @return {String} 作成したクエリ文字列.
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
 * querySelectorAll のショートハンドかつ戻り値は Array
 * @param {String} selector document.querySelectorAll へのセレクタ.
 * @return {Array} Array 化した NodeList.
 */
function $$(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
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
 * 自身を除いた自身の子要素をコピーします
 * @param {Object} node Node.
 * @return {Object} 子要素のクローンを内包した DocumentFragment.
 */
function cloneChildren(node) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(node.childNodes).map(function(elm) {
        frag.appendChild(elm.cloneNode(true));
    });
    return frag;
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

    xhr.open(options.method, url, async);
    for (var i = 0; options.requestHeaders && i < options.requestHeaders.length; i += 2) {
        xhr.setRequestHeader(options.requestHeaders[i], options.requestHeaders[i + 1]);
    }
    /* FIXME: GET の際は parameters を URL の後ろに付ける */
    xhr.send(options.parameters);
}


/**
 * HTML 文字列のうち script タグの始まりをエスケープします
 * @param {String} html エスケープしたい HTML 文字列.
 * @return {String} エスケープ済みの HTML 文字列.
 */
function escapeHtmlScript(html) {
    return html.replace(/<(?=\/?script)/g, '&lt;');
}

/**
 * Node の各種データを取り除きます
 * @param {Node} node 対象の Node オブジェクト.
 */
function trimNodeEtc(node) {
    trimNodeEvent(node);
    trimNodeClass(node);
    trimNodeStyle(node);
}

/**
 * Node の onevent 属性を取り、href="javascript:" を動かないようにします
 * @param {Node} node 対象の Node オブジェクト.
 */
function trimNodeEvent(node) {
    var attributes = node.attributes;
    for (var i = 0; i < attributes.length; ++i) {
        if (/^on/.test(attributes[i].name)) {
            node.removeAttribute(attributes[i].name);
        }
        else if (attributes[i].name == 'href' &&
            !/^https?:\/\//.test(attributes[i].value.trim()) &&
            !/^denied:/.test(attributes[i].value)) {
            node.setAttribute(attributes[i].name, 'denied:' + attributes[i].value);
        }
    }

    Array.prototype.slice.call(node.children).map(arguments.callee);
}

/**
 * Node の Element.Style を取り除きます
 * @param {Node} node 対象の Node オブジェクト.
 */
function trimNodeStyle(node) {
    node.removeAttribute('style');
    Array.prototype.slice.call(node.children).map(arguments.callee);

    if (node.tagName == 'FONT') {
        if (node.parentNode) {
            node.parentNode.replaceChild(cloneChildren(node), node);
        }
    }
}

/* 下降しながら className を除去します */
/**
 * Node の ClassName を取り除きます
 * @param {Node} node 対象の Node オブジェクト.
 */
function trimNodeClass(node) {
    node.className = '';
    Array.prototype.slice.call(node.children).map(arguments.callee);
}

/**
 * Post を作成するための関数群です
 * @namespace PostBuilder
 */
var PostBuilder = {
    /**
     * post_control 内の note_count 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    note_count: function(json) {
        /*
        var notes_onclick = [
            'display_post_notes(',
            json.id,
            ', \'',
            json.reblog_key,
            '\'); return false;'].join('');
        */
        var notes_onclick = 'void alert("このコマンドは実装できませんでした！！");';
        var notes = buildElement('a', {
                href: '#',
                id: 'show_notes_link_' + json.id,
                class: 'reblog_count',
                onclick: notes_onclick});

        var note_count = parseInt(json.note_count);
        notes.appendChild(buildElement('span', {
                id: 'note_link_less_' + json.id,
                style: 'display:none;',
                title: (note_count - 1) + ' notes'},
            note_count - 1));
        notes.appendChild(buildElement('span', {
                id: 'note_link_current_' + json.id,
                title: (note_count) + ' notes'},
            note_count));
        notes.appendChild(buildElement('span', {
                id: 'note_link_more_' + json.id,
                style: 'display:none;',
                title: (note_count + 1) + ' notes'},
            note_count + 1));

        return notes;
    },
    /**
     * post_control 内の reblog_button 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    reblog_button: function(json) {
        var url_reblog = ['/reblog', json.id, json.reblog_key].join('/');
        var url_fast_reblog = ['/fast_reblog', json.id, json.reblog_key].join('/');
        return buildElement('a', {
                href: url_reblog,
                class: 'reblog_button',
                title: 'Reblog',
                'data-fast-reblog-url': url_fast_reblog});
    },
    /**
     * post_control 内の like_button 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    like_button: function(json) {
        var frag = document.createDocumentFragment();

        var like_form = frag.appendChild(buildElement('form', {
                    method: 'post',
                    action: ['/like', json.reblog_key].join('/'),
                    id: 'like_form_' + json.id,
                    style: 'display: none'}));
        like_form.appendChild(buildElement('input', {
                type: 'hidden', name: 'id', value: json.id}));
        like_form.appendChild(buildElement('input', {
                type: 'hidden', id: 'form_key', name: 'form_key', value: LIKE_KEY}));

        var root_id;
        with ({url: json.reblogged_root_url}) {
            root_id = (url ? url.match(/(?:post\/(\d+)|private_\d+?(\d+))/)[1] : '');
        }
        var like_button = frag.appendChild(buildElement('a', {
                    class: 'like_button like_root_' + root_id,
                    href: '#',
                    title: 'like',
                    id: 'like_button_' + json.id,
                    'data-root-post-id': root_id,
                    onclick: 'submit_like(\'' + (json.id) + '\'); return false;'}));

        return frag;
    },
    /**
     * post 内の post_controls 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    controls: function(json) {
        var post_controls = buildElement('div', {class: 'post_controls'});

        post_controls.appendChild(PostBuilder.note_count(json));
        post_controls.appendChild(PostBuilder.reblog_button(json));
        post_controls.appendChild(PostBuilder.like_button(json));

        return post_controls;
    },
    /**
     * post 内の post_info 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    postInfo: function(json) {
        var post_info = buildElement('div', {class: 'post_info'});
        var html = [
            '<a href="http://' + json.blog_name + '.tumblr.com/">',
            json.blog_name,
            '</a>'];
        if (json.reblogged_from_url) {
            html = html.concat([
                ' reblogged ',
                '<a href="', json.reblogged_from_url, '">',
                json.reblogged_from_name,
                '</a>']);
        }
        html.push(':');
        post_info.innerHTML = html.join('');
        return post_info;
    },
    /**
     * post 内の content 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    content: function(json) {
        var post_content = buildElement('div', {
                class: 'post_content',
                id: 'post_content_' + json.id,
                style: 'clear: both;'});

        if (json.type == 'text') {
            post_content.appendChild(PostBuilder.contentOf.text(json));
        }
        else if (json.type == 'quote') {
            post_content.appendChild(PostBuilder.contentOf.quote(json));
        }
        else if (json.type == 'link') {
            post_content.appendChild(PostBuilder.contentOf.link(json));
        }
        else if (json.type == 'answer') {
            post_content.appendChild(PostBuilder.contentOf.answer(json));
        }
        else if (json.type == 'video') {
            post_content.appendChild(PostBuilder.contentOf.video(json));
        }
        else if (json.type == 'audio') {
            post_content.appendChild(PostBuilder.contentOf.audio(json));
        }
        else if (json.type == 'chat') {
            post_content.appendChild(PostBuilder.contentOf.chat(json));
        }
        else if (json.type == 'photo') {
            post_content.appendChild(PostBuilder.contentOf.photo(json));
        }

        return post_content;
    },
    /**
     * @namespace PostBuilder.contentOf
     */
    contentOf: {
        /**
         * post 内の content 要素を作成します (photo専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        photo: function(json) {
            var frag = document.createDocumentFragment();

            var highres = json.photos[0].alt_sizes[0];
            var minres = json.photos[0].alt_sizes.slice(-2)[0];
            var midres = json.photos[0].alt_sizes.slice(0, 2).reverse()[0];
            var width150 = '150px';
            var height150 = parseInt((150 * parseFloat(highres.height) / parseFloat(highres.width))) + 'px';
            var width500 = midres.width;
            var height500 = midres.height;
            var onload = [
                "if (this.src.indexOf('_100') != -1) {",
                "    this.style.backgroundColor = 'transparent';",
                "    this.src = '" + (midres.url) + "';",
                "}"].join('');
            var onclick = [
                onload,
                "if ($(this).hasClassName('enlarged')) {",
                "    this.style.width = '", width150, "';",
                "    this.style.height = '", height150, "';",
                "    $(this).removeClassName('enlarged');",
                "    if ($('photo_info_", json.id, "')) $('photo_info_", json.id, "').hide();",
                "    if ($('photo_exif_flipper_", json.id, "')) $('photo_exif_flipper_", json.id, "').hide();",
                "    $('post_content_", json.id, "').style.clear = 'none';",
                "} else {",
                "    $('post_content_", json.id, "').style.clear = 'both';",
                "    if ($('photo_info_", json.id, "')) $('photo_info_", json.id, "').show();",
                "    if ($('photo_exif_flipper_", json.id, "')) $('photo_exif_flipper_", json.id, "').show();",
                "    this.style.width = '", width500, "px';",
                "    this.style.height = '", height500, "px';",
                "    $(this).addClassName('enlarged');",
                "}",
                "this.blur();",
                "return false;"].join('');

            var style = [
                'cursor: pointer;',
                'background-color: transparent;',
                'width: ', width150, ';',
                'height: ', height150, ';'].join('');

            var post_image = buildElement('img', {
                    class: 'image_thumbnail',
                    id: 'thumbnail_photo_' + json.id,
                    src: minres.url,
                    style: style,
                    onclick: onclick,
                    onload: onload});

            frag.appendChild(post_image);

            if (json.link_url && /^https?:\/\/[^\/]+/.test(json.link_url)) {
                var link_domain = json.link_url.match(/^https?:\/\/([^\/]+)/)[1];
                var post_info = frag.appendChild(buildElement('div', {
                            id: 'photo_info_' + (json.id),
                            style: [
                                'display:none;',
                                'margin-top: 2px;',
                                'font-size:10px;',
                                'line-height:20px;',
                                'clear:both; height:27px;'].join('')}));
                post_info.appendChild(buildElement('a', {href: escape(json.link_url)}, escape(link_domain)));
                post_info.appendChild(document.createTextNode(' → '));
            }

            if (json.caption) {
                var post_caption = frag.appendChild(buildElement('div', {
                            class: 'caption',
                            style: 'margin-top:0px;'},
                        escapeHtmlScript(json.caption)));
                trimNodeEtc(post_caption);
            }

            return frag;
        },
        /**
         * post 内の content 要素を作成します (text専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        text: function(json) {
            var frag = document.createDocumentFragment();

            if (json.title) {
                var post_title = frag.appendChild(buildElement('div',
                        {class: 'post_title'},
                        escapeHtmlScript(json.title)));
                trimNodeEtc(post_title);
            }

            if (json.body) {
                var post_body = frag.appendChild(buildElementBySource(
                        escapeHtmlScript(json.body)));
                Array.prototype.slice.call(post_body).map(trimNodeEtc);
            }
            return frag;
        },
        /**
         * post 内の content 要素を作成します (quote専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        quote: function(json) {
            var frag = document.createDocumentFragment();

            if (json.text) {
                frag.appendChild(document.createTextNode('“'));

                var quote = frag.appendChild(buildElement('span', {}, escapeHtmlScript(json.text)));
                trimNodeEtc(quote);
                quote.className = 'quote';

                frag.appendChild(document.createTextNode('”'));
            }

            if (json.source) {
                var table_html = [
                    '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">',
                    '    <tbody>',
                    '        <tr>',
                    '            <td valign="top" style="width:1px; padding:0px 10px 0px 20px;">—</td>',
                    '            <td valign="top" class="quote_source"></td>',
                    '        </tr>',
                    '    </tbody>',
                    '</table>'].join('');
                var table = buildElementBySource(table_html);
                var quote_source = table.querySelector('.quote_source');
                quote_source.innerHTML = escapeHtmlScript(json.source);
                trimNodeEtc(quote_source);
                quote_source.className = 'quote_source';

                frag.appendChild(table);
            }

            return frag;
        },
        /**
         * post 内の content 要素を作成します (link専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        link: function(json) {
            var frag = document.createDocumentFragment();

            if (json.title) {
                var post_title = frag.appendChild(buildElement('div', {class: 'post_title'}));
                var link_title = post_title.appendChild(buildElement('a', {href: json.url}, escapeHtmlScript(json.title)));
                trimNodeEtc(link_title);
            }

            if (json.description) {
                var link_description = frag.appendChild(buildElement('div',
                        {style: 'margin-top: 10px;'}, escapeHtmlScript(json.description)));
                trimNodeEtc(link_description);
            }

            return frag;
        },
        /**
         * post 内の content 要素を作成します (answer専用) 未実装です
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        answer: function(json) {
            var frag = document.createDocumentFragment();
            /* これは何……？ */
            return frag;
        },
        /**
         * post 内の content 要素を作成します (video専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        video: function(json) {
            var frag = document.createDocumentFragment();

            var thumbnail = buildElement('a', {
                class: 'video_thumbnail',
                id: 'video_toggle_' + json.id,
                onclick: 'toggle_video_embed(' + (json.id) + '); return false;'});

            thumbnail.appendChild(buildElement('img', {
                    id: 'video_thumbnail_' + json.id,
                    src: json.thumbnail_url,
                    width: 150,
                    height: 113,
                    thumbnails: ''})); /* FIXME */

            /* TODO: div[onmouseover] */
            /* javascript: cycle_video_thumbnail */
            frag.appendChild(thumbnail);

            if (json.player.length) {
                var watch_video = frag.appendChild(buildElement('div', {
                            id: 'watch_video_' + json.id,
                            class: 'video',
                            style: 'display:none;'}));

                var outer_click = buildElement('div', {
                        style: 'font-size:10px; line-height:20px; clear:both; height:27px;'});
                outer_click.appendChild(buildElement('a', {
                            href: '#',
                            onclick: 'toggle_video_embed(' + (json.id) + '); return false;'},
                        'Hide video'));

                var video_code = buildElement('input', {
                        type: 'hidden',
                        id: 'video_code_' + json.id,
                        value: json.player[2].embed_code});

                watch_video.appendChild(buildElement('div', {id: 'video_embed_' + json.id, class: 'video_embed'}));
                watch_video.appendChild(outer_click);
                watch_video.appendChild(video_code);
            }

            if (json.caption) {
                var caption = frag.appendChild(buildElement('div', {class: 'caption'}, escapeHtmlScript(json.caption)));
                trimNodeEtc(caption);
            }

            return frag;
        },
        /**
         * post 内の content 要素を作成します (audio専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        audio: function(json) {
            var frag = document.createDocumentFragment();

            if (json.album_art) {
                frag.appendChild(buildElement('img', {
                            class: 'album_art',
                            alt: '',
                            onclick: "$(this).toggleClassName('album_art'); return false;",
                            title: escape(json.track_name), /* TODO: escape? */
                            src: encodeURI(json.album_art) /* TODO: escape? */}));
            }

            if (json.audio_url) {
                /* non-Flash info */
                frag.appendChild(buildElement('span', {
                            id: 'audio_node_' + json.id},
                        '[<a href="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" target="_blank">Flash 9</a>is required to listen to audio.]'));

                /* Audio script */
                var inner = [
                    "replaceIfFlash(9, 'audio_node_", json.id, "', ",
                    "'<div>", json.player.replace('player.swf', 'player_black.swf'), "</div>');"].join('');
                frag.appendChild(buildElement('script', {type: 'text/javascript'}, inner));
            }

            if (json.caption) {
                var post_body = frag.appendChild(buildElement('div', {
                            style: 'margin: 10px;',
                            class: 'post_body'},
                        escapeHtmlScript(json.caption)));
                trimNodeEtc(post_body);
            }

            return frag;
        },
        /**
         * post 内の content 要素を作成します (conversation専用)
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        chat: function(json) {
            var frag = document.createDocumentFragment();

            if (json.title) {
                var post_title = frag.appendChild(buildElement('div', {},
                        escapeHtmlScript(json.title)));
                trimNodeEtc(post_title);
                post_title.className = 'post_title';
            }

            if (json.body) {
                var conversation_lines = frag.appendChild(buildElement('ul', {class: 'conversation_lines'}));

                json.body.split('\n').map(function(line) {
                    if (line.trim() == '') {
                        return;
                    }

                    line = line.replace('<', '&lt;');

                    var li = buildElement('li', {class: 'chat_line'});
                    li.innerHTML = [
                        '<strong>',
                        line.slice(0, line.search(':')),
                        '</strong>',
                        line.slice(line.search(':'))].join('');
                    conversation_lines.appendChild(li);
                });
            }

            return frag;
        }
    },
    /**
     * post 内の footer_links 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    footerLinks: function(json) {
        var footer_links = buildElement('div', {
                class: 'footer_links'});
        if (json.source_url) {
            var source_url = footer_links.appendChild(buildElement('span', {
                        id: 'source_url_' + json.id,
                        class: 'source_url'}));
            source_url.appendChild(buildElement('a', {
                        href: encodeURI(json.source_url)},
                    'Source: ' + escape(json.source_title)));
            source_url.appendChild(buildElement('div', {
                        class: 'source_url_gradient'}));

            footer_links.className += ' with_source_url';
        }

        if (json.tags.length) {
            var tags_wrapper = footer_links.appendChild(buildElement('span', {
                            id: 'post_tags_wrapper_' + json.id}));
            var tags_node = tags_wrapper.appendChild(buildElement('span', {
                            id: 'post_tags_' + json.id,
                            class: 'tags'}));

            json.tags.map(function(tag) {
                tags_node.appendChild(buildElement('a', {
                            class: 'tag',
                            href: '/tagged/' + encodeURI(tag)},
                        '#' + escape(tag)));
            });

            footer_links.className += ' with_tags';
        }
        return footer_links;
    },
    /**
     * post 内の note_outer_container 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    notesOuterContainer: function(json) {
        var notes_outer_container = buildElement('div', {
                id: 'notes_outer_container_' + json.id,
                style: 'display:none; overflow:hidden; clear:both;'});
        var notes_outer_container_inner = buildElement('div', {
                style: 'padding-top:10px;'});
        var notes_container = buildElement('div', {
                id: 'notes_container_' + json.id,
                style: 'display:none; overflow:hidden;'});
        var notes_control = buildElement('div', {
                id: 'notes_control_' + json.id,
                class: 'notes_control'});
        var notes_loader = buildElement('div', {
                id: 'notes_loader_' + json.id,
                class: 'notes_loader'},
            'Loading...');
        var notes_hide_link = buildElement('div', {
                id: 'notes_hide_link_' + json.id,
                style: 'display:none;',
                class: 'notes_hide_link'});
        var notes_hide_alink = buildElement('a', {
                href: '#',
                onclick: 'Effect.SlideUp(\'notes_outer_container_' + (json.id) + '\'); return false;',
                style: 'color:#79A0BE;'},
            'Hide notes');

        notes_outer_container.appendChild(notes_outer_container_inner);
        notes_outer_container_inner.appendChild(notes_container);
        notes_outer_container_inner.appendChild(notes_control);
        notes_control.appendChild(notes_loader);
        notes_control.appendChild(notes_hide_link);
        notes_hide_link.appendChild(notes_hide_alink);

        return notes_outer_container;
    },
    /**
     * post 内の avatar_and_i 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    avatarAndI: function(json) {
        /* 他にも追加するノードがあります */
        var avatar_and_i = buildElement('div', {
                class: 'avatar_and_i'});
        var url_icon = 'background-image:url(\'http://api.tumblr.com/v2/blog/' + (json.blog_name) + '.tumblr.com/avatar/64\');';
        var post_avatar = avatar_and_i.appendChild(buildElement('a', {
                    href: 'http://' + json.blog_name + '.tumblr.com/',
                    title: '???', /* FIXME */
                    class: 'post_avatar',
                    id: 'post_avatar_' + json.id,
                    style: url_icon}));

        return avatar_and_i;
    },
    /**
     * post 内の post_permalink 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    postPermalink: function(json) {
        /**
         * title:
         *   View post -
         *           11:02am, 8:02pm
         *      Monday,      11:24am
         *      January 28th, 8:46am
         */
        var permalink_title = 'View post - ';

        var now = new Date();
        var post_date = new Date(json.timestamp);

        if (now.getDay() == post_date.getDay()) {
            /* pass */
        }
        else if (false /* 一週間以内か */) {
            var day_of_week = (new Date(json.timestamp)).getUTCDay();
            permalink_title += [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day_of_week];
        }
        else if (false /* その他 */) {
            var month = (new Date(json.timestamp)).getMonth();
            permalink_title += [
                'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'][month];

            permalink_title += ' ';

            var day = (new Date(json.timestamp)).getDate();
            if (day <= 3) {
                permalink_title += ['1st', '2nd', '3rd'][day];
            }
            else {
                permalink_title += (day) + 'th';
            }

            permalink_title += ', ';
        }

        permalink_title += [
            post_date.getUTCHours() % 12, post_date.getUTCMinutes()].join(':');
        permalink_title += ['am', 'pm'][parseInt(post_date.getUTCHours() / 12)];

        return buildElement('a', {
                href: json.post_url,
                title: permalink_title,
                class: 'permalink',
                id: 'permalink_' + json.id});
    },
    /**
     * 擬似的に post 要素を作成します
     * @param {Object} json API が返すうちポスト単位の JSON.
     * @return {Node} 作成した Node オブジェクト.
     */
    similarPost: function(json) {
        /* APIv2で取得したJSONデータのうち post の部分で .post を作成します */
        /* FIXME: liked かどうか分からないものだろうか */

        var post = buildElement('li', {id: 'post_' + json.id});
        post.className = [
            'post',
            json.type,
            (json.reblogged_from_name ? 'is_reblog' : ''),
            'not_mine'].join(' ');  /* FIXME: is_mine 付けられるようなら付ける */

        /* 謎要素です */
        post.appendChild(buildElement('div', {class: 'corner_mask'}));

        /* notes, Reblog, Like など */
        post.appendChild(PostBuilder.controls(json));

        /* A reblogged B: */
        post.appendChild(PostBuilder.postInfo(json));

        /* 謎要素です */
        post.appendChild(buildElement('div', {
                    id: 'reply_pane_outer_container_' + json.id,
                    style: 'clear:both; display:none;'}));

        /* 各 type のポストコンテンツです */
        post.appendChild(PostBuilder.content(json));

        /* 多分 clearfix です*/
        post.appendChild(buildElement('div', {class: 'clear'}));

        /* <div class="footer_links  with_source_url"> */
        post.appendChild(PostBuilder.footerLinks(json));

        /* Notes 一覧 */
        post.appendChild(PostBuilder.notesOuterContainer(json));

        /* avatar アイコン */
        post.appendChild(PostBuilder.avatarAndI(json));

        /* arrow */
        post.appendChild(buildElement('span', {class: 'arrow'}));

        /* 右上に出る折れる Permalink */
        post.appendChild(PostBuilder.postPermalink(json));

        return post;
    }
};

/**
 * 引数から path を作成します
 * @param {String} tumblelog tumbelog名.
 * @param {String} type 取得対象のタイプ.
 * @param {String} offset post の取得位置オフセット.
 * @return {String} 上記をまとめた URL.
 */
function buildNecromancyURL(tumblelog, type, offset) {
    var url = ['http://www.tumblr.com/blog'];

    if (tumblelog)           url.push(tumblelog);
    if (type)                url.push(type);
    if (offset != undefined) url.push(offset);

    return url.join('/');
}

/**
 * API から次ページのポストを取得しているかどうか監視します
 * @param {Object} pe PeriodicalExecuter オブジェクト.
 */
function necromancyObserver(pe) {
    if (window.prev_json != window.new_json) {
        window.prev_json = window.new_json;
        necromancyCallback(new_json);
    }

    var parsed_page_path = window.location.href.match(PATH_PARSER);
    if (window.new_json && parsed_page_path[3] >= window.new_json.response.total_posts) {
        pe.stop();
        $('auto_pagination_loader').hide();
    }
}

/**
 * API から次ポスト群の取得に成功したら呼び出される関数
 * callback と名付けて有りますがコールバック関数ではありません
 * @param {Object} json API が返す JSON データです.
 */
function necromancyCallback(json) {
    console.log(json.response);

    var posts_node = document.querySelector('#posts');
    var posts = json.response.posts.map(function(json_post) {
        var post = PostBuilder.similarPost(json_post);
        post.className += ' same_user_as_last';
        return posts_node.appendChild(post);
    });
    if (posts.length) {
        posts[0].className = posts[0].className.replace('\bsame_user_as_last\b', '');
    }

    var next_page_parsed = window.next_page.match(PATH_PARSER);
    var tumblelog = next_page_parsed[1];
    var type = next_page_parsed[2] || '';
    var offset = parseInt(next_page_parsed[3]);

    var cur_path = buildNecromancyURL(tumblelog, type, offset || 0);
    history.pushState('', '', cur_path);

    var script = document.querySelector('body > script.necromancy_paginator');
    script.parentNode.removeChild(script);

    window.next_page = buildNecromancyURL(tumblelog, type, (offset || 0) + 10);
    window.loading_next_page = false;
}


/**
 * スクロール位置として次ページの読み込みを監視します
 * @param {Object} pe PeriodicalExecuter オブジェクト.
 */
function necromancyPaginator(pe) {
    if (!window.next_page) {
        pe.stop();
        return;
    }
    if (window.loading_next_page) {
        return;
    }

    var posts;
    if ((posts = $$('#posts > li')) &&
        (posts[posts.length - 1].positionedOffset().top - (document.viewport.getDimensions().height + document.viewport.getScrollOffsets().top)) < window.LOAD_SCROLL_OFFSET) {
        window.loading_next_page = true;

        var next_page_parsed = window.next_page.match(PATH_PARSER);
        var tumblelog = next_page_parsed[1];
        var type = next_page_parsed[2] || '';
        var offset = parseInt(next_page_parsed[3] || 0);


        if (tumblelog.search('\\.') == -1) {
            tumblelog += '.tumblr.com';
        }

        var querystring = buildQueryString({
            limit: 10,
            api_key: API_KEY,
            reblog_info: 'true',
            offset: offset,
            jsonp: 'window.new_json = '});

        var url = [
            'http://api.tumblr.com/v2/blog',
            tumblelog,
            'posts',
             type + '?' + querystring].join('/');

        var script = buildElement('script', {
            src: url,
            class: 'necromancy_paginator',
            onload: 'if (window.prev_json == window.new_json) {window.loading_next_page = false;;}'});
        document.body.appendChild(script);
    }
}

/**
 * ユーザスクリプトが実行された際に呼び出される関数です
 */
function necromancyInitialize() {
    var lang_script = buildElement('script', {
            src: 'http://assets.tumblr.com/languages/strings/en_US.js?838'});
    var dsbd_script = buildElement('script', {
            src: 'http://assets.tumblr.com/javascript/prototype_effects_application_tumblelog.js?838'});
    document.head.appendChild(lang_script);
    document.head.appendChild(dsbd_script);

    new Ajax('/dashboard', {
        method: 'GET',
        onSuccess: function(xhr) {
            var userscript_styles = $$('head>.tumblr_userscript');
            var stylish_styles = $$('head>.stylish');

            var head = xhr.responseText.match(/<head>([\s\S]*)<\/head>/)[1];
            var body = xhr.responseText.match(/<body[^>]+>([\s\S]*)<\/body>/)[1];

            var elm_head = document.createElement('head');
            var elm_body = document.createElement('body');

            document.documentElement.replaceChild(elm_head, document.head);
            document.documentElement.replaceChild(elm_body, document.body);

            elm_body.innerHTML = body;
            var like_key = elm_body.querySelector('form[id^=like_form] #form_key').value;
            var posts = elm_body.querySelectorAll('#posts>li:not(.new_post)');
            Array.prototype.slice.call(posts).map(function(elm) {
                elm.parentNode.removeChild(elm);
            });

            elm_head.innerHTML = head;
            userscript_styles.concat(stylish_styles).map(function(node) {
                elm_head.appendChild(node);
            });

            var cmd = [
                'start_observing_key_commands(1);',
                'initialize_tabs();',
                'window.next_page = location.pathname;',
                'window.prev_json = window.new_json = null;',
                'window.API_KEY = "', API_KEY, '";',
                'window.LIKE_KEY = "', like_key, '";',
                'window.PATH_PARSER = ', PATH_PARSER, ';',
                'window.LOAD_SCROLL_OFFSET = ', LOAD_SCROLL_OFFSET, ';',
                'window.PostBuilder = ', serialize(PostBuilder), ';',
                cloneChildren,
                escapeHtmlScript,
                trimNodeEtc,
                trimNodeEvent,
                trimNodeStyle,
                trimNodeClass,
                necromancyPaginator,
                necromancyObserver,
                necromancyCallback,
                buildQueryString,
                buildElement,
                buildElementBySource,
                buildNecromancyURL,
                'new PeriodicalExecuter(necromancyPaginator, 0.2);',
                'new PeriodicalExecuter(necromancyObserver, 0.02);',
                'void 0;'].join('');

            execClient(cmd, 0);
        }
    });
}

/**
 * ユーザスクリプトが呼び出されたさいに呼び出されるメイン関数です
 */
function main() {
    necromancyInitialize();
}

/**
 * スクリプトの実行はこのページで良いのか返します
 * @return {Boolean} 実行してよいページの場合は true を返します.
 */
function isExecPage() {
    if (PATH_PARSER.test(location) &&
        /^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location) /* for Opera */ &&
        /<script type="text\/javascript" language="javascript">var status_code = '(403|404)'<\/script>/.test(
            document.documentElement.innerHTML)) {
        return true;
    }
    return false;
}

if (!isExecPage()) {
    /* thrhough */
}
else if (window.document.body) {
    main();
}
else {
    window.document.addEventListener('DOMContentLoaded', main, false);
}

})());
