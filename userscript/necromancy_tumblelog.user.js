// ==UserScript==
// @name        Necromancy Tumblelog
// @match       http://www.tumblr.com/blog/*
// @version     0.0.1
// @description 他人の tumblelog を自分の blog ページの様に表示させます
// 
// @author      poochin
// @license     MIT
// @updated     2012-05-08
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/.*
// ==/UserScript==

// TODO: ランダム機能を付けます
// TODO: 分類ごとにオブジェクトにします

// FIXME: font タグの除去方法

/* ここからコピペコード */

// http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
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
            for (i = 0; i < len-1; i++) { str += serialize(_obj[i]) + ','; }
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

/* コピペコードここまで */


var PATH_PARSER = /\/blog\/(?:([^\/]+)\/?)(?:([a-z\-_]+)\/?)?(?:(\d+)\/?)?$/;

/* 一度の処理で一度の javascript コードを location に指定できない為、遅延させて実行させます */
function execClient(code, lazy)
{
    lazy = (typeof lazy == 'undefined' ? 0 : lazy);
    setTimeout(function() {location.assign('javascript:' + code)}, lazy)
}

/* {}オブジェクトから HTTP 送信クエリ文字列を作成します */
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

/* document.querySelectorAll into Array */
function $$(selector)
{
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

/* buildElement */
function buildElement(tag_name, propaties, innerHTML)
{
    var elm = document.createElement(tag_name);
    for (var key in propaties) {
        elm.setAttribute(key, propaties[key]);
    }
    elm.innerHTML = innerHTML || '';
    return elm;
}

function cloneChildren(node) {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < node.childNodes.length; ++i) {
        frag.appendChild(node.childNodes[i].cloneNode(true));
    }

    return frag;
}

function buildElementBySource(html) {
    var range = document.createRange();
    range.selectNodeContents(document.body);
    return range.createContextualFragment(html).childNodes[0];
}

/* prototype.js 風 Ajax */
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
            else if ((status / 100) == 4 || (status / 100) == 5) {
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


function escapeHtmlScript(html) {
    return html.replace(/<(?=\/?script)/g, '&lt;');
}

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

    if (node.children.length) {
        for (var i = 0; i < node.children.length; ++i) {
            trimNodeEvent(node.children.item(i));
        }
    }
}

/* style などを取り除きます */
function trimNodeStyle(node) {
    if (node.childNodes) {
        for (var i = 0; i < node.children.length; ++i) {
            trimNodeStyle(node.children.item(i));
        }
    }

    if (node.tagName == 'FONT') {
        if (node.parentNode) {
            node.parentNode.replaceChild(cloneChildren(node), node);
        }
    }
    else {
        node.removeAttribute('style');
    }
}

/* 下降しながら className を除去します */
function trimNodeClass(node) {
    node.className = '';
    if (node.childNodes) {
        for (var i = 0; i < node.children.length; ++i) {
            trimNodeClass(node.children.item(0));
        }
    }
}

var PostBuilder = {
    notes: function(json) {
    },
    like_button: function(json) {
    },
    reblog_button: function(json) {
    },
    controls: function(json) {
        var post_controls = buildElement('div', {class: 'post_controls'});
    
        /* post_controls > notes */
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
                title: (note_count - 1)+ ' notes'},
            note_count - 1));
        notes.appendChild(buildElement('span', {
                id: 'note_link_current_' + json.id,
                title: (note_count) + ' notes'},
            note_count));
        notes.appendChild(buildElement('span', {
                id: 'note_link_more_' + json.id,
                style: 'display:none;',
                title: (note_count + 1)+ ' notes'},
            note_count + 1));
        post_controls.appendChild(notes);
    
        /* post_controles > reblog */
        var url_reblog = ['/reblog', json.id, json.reblog_key].join('/');
        var url_fast_reblog = ['/fast_reblog', json.id, json.reblog_key].join('/');
        var reblog_button = buildElement('a', {
                href: url_reblog,
                class: 'reblog_button',
                title: 'Reblog',
                'data-fast-reblog-url': url_fast_reblog});
    
        post_controls.appendChild(reblog_button);
    
        /* post_controles > like */
        var like_form = buildElement('form', {
                method: 'post',
                action: ['/like', json.reblog_key].join('/'),
                id: 'like_form_' + json.id,
                style: 'display: none'});
        like_form.appendChild(buildElement('input', {
                type: 'hidden', name: 'id', value: json.id}));
        like_form.appendChild(buildElement('input', {
                type: 'hidden', id: 'form_key', name: 'form_key', value: LIKE_KEY}));
    
        post_controls.appendChild(like_form);
    
        var root_id;
        with ({url: json.reblogged_root_url}) {
            root_id = (url ? url.match(/(?:post\/(\d+)|private_\d+?(\d+))/)[1] : '');
        }
        var like_button = buildElement('a', {
                class: 'like_button like_root_' + root_id,
                href: '#',
                title: 'like',
                id: 'like_button_' + json.id,
                'data-root-post-id': root_id,
                onclick: 'submit_like(\'' + (json.id) + '\'); return false;'});
    
        post_controls.appendChild(like_button);
        return post_controls;
    },
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
    contentOf: {
        photo: function(json) {
            var frag = document.createDocumentFragment();
        
            var highres = json.photos[0].alt_sizes[0];
            var minres = json.photos[0].alt_sizes.slice(-2)[0];
            var midres = json.photos[0].alt_sizes[1];
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
            frag.appendChild(document.createTextNode(' '));
        
            if (json.link_url && /^https?:\/\/[^\/]+/.test(json.link_url)) {
                var link_domain = json.link_url.match(/^https?:\/\/([^\/]+)/)[1];
                var post_info = buildElement('div', {
                        id: 'photo_info_' + (json.id),
                        style: [
                            'display:none;',
                            'margin-top: 2px;',
                            'font-size:10px;',
                            'line-height:20px;',
                            'clear:both; height:27px;'].join('')});
                post_info.appendChild(buildElement('a', {href: escape(json.link_url)}, escape(link_domain)));
                post_info.appendChild(document.createTextNode(' → '));
            
                frag.appendChild(post_info);
            }
        
            if (json.caption) {
                var post_caption = buildElement('div', {
                        class: 'caption',
                        style: 'margin-top:0px;'},
                    escapeHtmlScript(json.caption));
                trimNodeEvent(post_caption);
                trimNodeStyle(post_caption);
                trimNodeClass(post_caption);
                frag.appendChild(post_caption);
            }
        
            return frag;
        },
        text: function(json) {
            var frag = document.createDocumentFragment();
        
            if (json.title) {
                var post_title = buildElement('div', {class: 'post_title'}, escapeHtmlScript(json.title));
                trimNodeEvent(post_title);
                trimNodeStyle(post_title);
                trimNodeClass(post_title);
                frag.appendChild(post_title);
            }
        
            if (json.body) {
                var post_body_outer = buildElement('div', {}, escapeHtmlScript(json.body));
                trimNodeStyle(post_body_outer);
                trimNodeEvent(post_body_outer);
                trimNodeClass(post_body_outer);
        
                while (post_body_outer.children.length) {
                    frag.appendChild(post_body_outer.children.item(0));
                }
        
            }
            return frag;
        },
        quote: function(json) {
            var frag = document.createDocumentFragment();
        
            if (json.text) {
                frag.appendChild(document.createTextNode('“'));
        
                var quote = buildElement('span', {}, escapeHtmlScript(json.text));
                trimNodeEvent(quote);
                trimNodeStyle(quote);
                trimNodeClass(quote);
                quote.className = 'quote';
                frag.appendChild(quote);
        
                frag.appendChild(document.createTextNode('”'));
            }
        
            if (json.source) {
                var table = buildElementBySource([
                    '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">',
                    '    <tbody>',
                    '        <tr>',
                    '            <td valign="top" style="width:1px; padding:0px 10px 0px 20px;">—</td>',
                    '            <td valign="top" class="quote_source"></td>',
                    '        </tr>',
                    '    </tbody>',
                    '</table>'].join(''));
        
                var quote_source = table.querySelector('.quote_source');
                quote_source.innerHTML = escapeHtmlScript(json.source);
                trimNodeStyle(quote_source);
                trimNodeEvent(quote_source);
                trimNodeClass(quote_source);
        
                frag.appendChild(table);
            }
        
            return frag;
        },
        link: function(json) {
            var frag = document.createDocumentFragment();
        
            if (json.title) {
                var post_title = buildElement('div', {class: 'post_title'});
                var link_title = buildElement('a', {href: json.url}, escapeHtmlScript(json.title));
                trimNodeEvent(link_title);
                trimNodeStyle(link_title);
                trimNodeClass(link_title);
                post_title.appendChild(link_title);
                frag.appendChild(post_title);
        
            }
        
            if (json.description) {
                var link_description = buildElement('div', {style: 'margin-top: 10px;'}, escapeHtmlScript(json.description));
                trimNodeEvent(link_description);
                trimNodeStyle(link_description);
                trimNodeClass(link_description);
                frag.appendChild(link_description);
            }
        
            return frag;
        },
        answer: function(json) {
            var frag = document.createDocumentFragment();
            /* これは何……？ */
            return frag;
        },
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
                var watch_video = buildElement('div', {
                        id: 'watch_video_' + json.id,
                        class: 'video',
                        style: 'display:none;'});
            
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
            
                frag.appendChild(watch_video);
            }
        
            if (json.caption) {
                var caption = buildElement('div', {class: 'caption'}, escapeHtmlScript(json.caption));
                trimNodeEvent(caption);
                trimNodeStyle(caption);
                trimNodeClass(caption);
        
                frag.appendChild(caption);
            }
        
            return frag;
        },
        audio: function(json) {
            var frag = document.createDocumentFragment();
        
            if (json.album_art) {
                var album_art = buildElement('img', {
                        class: 'album_art',
                        alt: '',
                        onclick: "$(this).toggleClassName('album_art'); return false;",
                        title: escape(json.track_name), /* TODO: escape? */
                        src: encodeURI(json.album_art) /* TODO: escape? */});
        
                frag.appendChild(album_art);
            }
        
            if (json.audio_url) {
                /* non-Flash info */
                var noflash = buildElement('span', {
                        id: 'audio_node_' + json.id},
                    '[<a href="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" target="_blank">Flash 9</a>is required to listen to audio.]');
        
                frag.appendChild(noflash);
        
                /* Audio script */
                var inner = [
                    "replaceIfFlash(9, 'audio_node_", json.id, "', ",
                    "'<div>", json.player.replace('player.swf', 'player_black.swf'), "</div>');"].join('');
                var audio_script = buildElement('script', {type: 'text/javascript'}, inner);
        
                frag.appendChild(audio_script);
            }
        
            if (json.caption) {
                var post_body = buildElement('div', {
                        style: 'margin: 10px;',
                        class: 'post_body'},
                    escapeHtmlScript(json.caption));
                trimNodeStyle(post_body);
                trimNodeEvent(post_body);
                trimNodeClass(post_body);
                frag.appendChild(post_body);
            }
        
            return frag;
        },
        chat: function(json) {
            var frag = document.createDocumentFragment();
        
            if (json.title) {
                var post_title = buildElement('div', {
                        class: 'post_title'},
                    escapeHtmlScript(json.title));
                trimNodeEvent(post_title);
                trimNodeStyle(post_title);
                trimNodeClass(post_title);
        
                frag.appendChild(post_title);
            }
        
            if (json.body) {
                var conversation_lines = buildElement('ul', {class: 'conversation_lines'});
        
                json.body.split('\n').map(function(line) {
                    if (line.trim() == '') {
                        return;
                    }
        
                    line = line.replace('<', '&lt;');
        
                    var li = buildElement('li', {class: 'chat_line'});
                    if (line.search(':') == -1) {
                        li.innerText = line;
                    }
                    else {
                        var m = line.match(/^([^:]+:)(.+)$/);
                        li.innerHTML = [
                            '<strong>',
                            m[1],
                            '</strong>',
                            m[2]].join('');
                    }
        
                    conversation_lines.appendChild(li);
                });
        
                frag.appendChild(conversation_lines);
            }
        
            return frag;
        }
    },
    footerLinks: function(json) {
        var footer_links = buildElement('div', {
                class: 'footer_links'});
        if (json.source_url) {
            var source_url = buildElement('span', {
                    id: 'source_url_' + json.id,
                    class: 'source_url'});
            source_url.appendChild(buildElement('a', {
                        href: encodeURI(json.source_url)},
                    'Source: ' + escape(json.source_title)));
            source_url.appendChild(buildElement('div', {
                        class: 'source_url_gradient'}));
    
            footer_links.appendChild(source_url);
            footer_links.className += ' with_source_url';
        }
    
        if (json.tags.length) {
            var tags_wrapper = buildElement('span', {
                    id: 'post_tags_wrapper_' + json.id});
            var tags_node = buildElement('span', {
                id: 'post_tags_' + json.id,
                class: 'tags'});
            for (var i = 0; i < json.tags.length; ++i) {
                var tag = json.tags[i];
                tags_node.appendChild(buildElement('a', {
                            class: 'tag',
                            href: '/tagged/' + encodeURI(tag)},
                        '#' + escape(tag)));
            }
            tags_wrapper.appendChild(tags_node);
    
            footer_links.appendChild(tags_wrapper);
            footer_links.className += ' with_tags';
        }
        return footer_links;
    },
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
    avatarAndI: function(json) {
        /* 他にも追加するノードがあります */
        var avatar_and_i = buildElement('div', {
                class: 'avatar_and_i'});
        var url_icon = 'background-image:url(\'http://api.tumblr.com/v2/blog/'+(json.blog_name)+'.tumblr.com/avatar/64\');';
        var post_avatar = buildElement('a', {
                href: 'http://' + json.blog_name + '.tumblr.com/',
                title: '???', /* FIXME */
                class: 'post_avatar',
                id: 'post_avatar_' + json.id,
                style: url_icon});
    
        avatar_and_i.appendChild(post_avatar);
        return avatar_and_i;
    },
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
    
            switch(day_of_week) {
                case 0: permalink_title += 'Sunday';    break;
                case 1: permalink_title += 'Monday';    break;
                case 2: permalink_title += 'Tuesday';   break;
                case 3: permalink_title += 'Wednesday'; break;
                case 4: permalink_title += 'Thursday';  break;
                case 5: permalink_title += 'Friday';    break;
                case 6: permalink_title += 'Saturday';  break;
            }
            permalink_title += ', ';
        }
        else if (false /* その他 */) {
            var month = (new Date(json.timestamp)).getMonth();
    
            switch(month) {
                case  0: permalink_title += 'January'; break;
                case  1: permalink_title += 'February'; break;
                case  2: permalink_title += 'March'; break;
                case  3: permalink_title += 'April'; break;
                case  4: permalink_title += 'May'; break;
                case  5: permalink_title += 'June'; break;
                case  6: permalink_title += 'July'; break;
                case  7: permalink_title += 'August'; break;
                case  8: permalink_title += 'September'; break;
                case  9: permalink_title += 'October'; break;
                case 10: permalink_title += 'November'; break;
                case 11: permalink_title += 'December'; break;
            }
    
            var day = (new Date(json.timestamp)).getDate();
            if (day == 1) {
                permalink_title += ' 1st';
            }
            if (day == 2) {
                permalink_title += ' 2nd';
            }
            if (day == 3) {
                permalink_title += ' 3rd';
            }
            else {
                permalink_title += (day) + 'th';
            }
    
            permalink_title += ', ';
        }
    
        /* TODO */
        if (false /* 午前中か */) {
        }
        else {
            /* 午後です */
        }
    
        var permalink_title = '';
        return buildElement('a', {
                href: json.post_url,
                title: permalink_title,
                class: 'permalink',
                id: 'permalink_' + json.id});
    },
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
        var post_controls = PostBuilder.controls(json);
        post.appendChild(post_controls);
    
        /* A reblogged B: */
        var post_info = PostBuilder.postInfo(json);
        post.appendChild(post_info);
    
        /* 謎要素です */
        post.appendChild(buildElement('div', {
                    id: 'reply_pane_outer_container_' + json.id,
                    style: 'clear:both; display:none;'}));
    
        /* 各 type のポストコンテンツです */
        var post_content = PostBuilder.content(json);
        post.appendChild(post_content);
    
        /* 多分 clearfix です*/ 
        post.appendChild(buildElement('div', {class: 'clear'}));
    
        /* <div class="footer_links  with_source_url"> */
        var footer_links = PostBuilder.footerLinks(json);
        if (footer_links) {
            post.appendChild(footer_links);
        }
    
        /* Notes 一覧 */
        var notes_outer_container = PostBuilder.notesOuterContainer(json);
        post.appendChild(notes_outer_container);
    
        /* avatar アイコン */
        var avatar_and_i = PostBuilder.avatarAndI(json);
        post.appendChild(avatar_and_i);
    
        /* arrow */
        post.appendChild(buildElement('span', {class: 'arrow'}));
    
        /* 右上に出る折れる Permalink */
        post.appendChild(PostBuilder.postPermalink(json));
    
        return post;
    }
};

function buildNecromancyURL(tumblelog, type, offset) {
    var url = ['http://www.tumblr.com/blog'];

    if (tumblelog)           url.push(tumblelog);
    if (type)                url.push(type);
    if (offset != undefined) url.push(offset);

    return url.join('/');
}


/* tumblr が api に失敗して html を返してくる事があるのでオブザーブ形式にしています */
function necromancy_observer(pe) {
    if (window.prev_json != window.new_json) {
        necromancy_callback(new_json);
    }
    window.prev_json = window.new_json;

    var next_page_parsed = window.location.href.match(PATH_PARSER);
    if (window.new_json && next_page_parsed[3] >= window.new_json.response.total_posts) {
        pe.stop();
        $('auto_pagination_loader').hide();
    }
}

function necromancy_callback(json) {
    console.log(json.response);
    var posts_node = document.querySelector('#posts');
    var posts = json.response.posts.map(function(json_post) {
        /* console.log(json_post); */
        var post = PostBuilder.similarPost(json_post);
        post.className += ' same_user_as_last';
        return posts_node.appendChild(post);
    });
    if (posts.length) {
        posts[0].className = posts[0].className.replace(' same_user_as_last');
    }

    var next_page_parsed = window.next_page.match(PATH_PARSER);
    var tumblelog = next_page_parsed[1];
    var type = next_page_parsed[2] || '';
    var offset = parseInt(next_page_parsed[3]);

    var cur_url = buildNecromancyURL(tumblelog, type, offset || 0);
    history.pushState('', '', cur_url);

    var script = document.querySelector('body > script.necromancy_paginator');
    script.parentNode.removeChild(script);

    window.next_page = buildNecromancyURL(tumblelog, type, (offset || 0) + 10);
    window.loading_next_page = false;;
}

function necromancy_paginator(pe) {
    if (!window.next_page) {
        pe.stop();
        return;
    }
    if (window.loading_next_page) {
        return;
    }

    var posts;
    if ((posts = $$('#posts > li')) &&
        (posts[posts.length - 1].positionedOffset().top - (document.viewport.getDimensions().height + document.viewport.getScrollOffsets().top)) < 8000) {
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
             type +  '?' + querystring].join('/');

        var script = buildElement('script', {
            src: url,
            class: 'necromancy_paginator',
            onload: 'if (window.prev_json == window.new_json) {window.loading_next_page = false;;}'});
        document.body.appendChild(script);
    }
}


function buildMainPage() {
    new Ajax('/dashboard', {
        method: 'GET',
        onSuccess: function(xhr) {
            var userscript_styles = $$('head>.tumblr_userscript');
            var stylish_styles = $$('head>.stylish');

            var head = xhr.responseText.match(/<head>([\s\S]*)<\/head>/)[1];
            var body = xhr.responseText.match(/<body[^>]+>([\s\S]*)<\/body>/)[1];

            var lang_script = buildElement('script', {
                    src: 'http://assets.tumblr.com/languages/strings/en_US.js?838'});
            var dsbd_script = buildElement('script', {
                    src: 'http://assets.tumblr.com/javascript/prototype_effects_application_tumblelog.js?838'});
            var apikey_script = buildElement('script', {},
                'var API_KEY = "lu2Ix2DNWK19smIYlTSLCFopt2YDGPMiESEzoN2yPhUSKbYlpV";');
            var origin_script = buildElement('script', {});
            var next_page_script = buildElement('script', {}, '');

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
            elm_head.appendChild(lang_script);
            elm_head.appendChild(dsbd_script);
            elm_head.appendChild(apikey_script);

            var cmd = [
                'start_observing_key_commands(1);',
                'initialize_tabs();',
                'window.next_page = location.pathname;',
                'window.prev_json = window.new_json = null;',
                'window.LIKE_KEY = "', like_key, '";',
                'window.PATH_PARSER = ', PATH_PARSER, ';',
                'window.PostBuilder = ', serialize(PostBuilder), ';',
                cloneChildren.toString(),
                escapeHtmlScript.toString(),
                trimNodeEvent.toString(),
                trimNodeStyle.toString(),
                trimNodeClass.toString(),
                necromancy_paginator.toString(),
                necromancy_observer.toString(),
                necromancy_callback.toString(),
                buildQueryString.toString(),
                buildElement.toString(),
                buildElementBySource.toString(),
                buildNecromancyURL.toString(),
                'new PeriodicalExecuter(necromancy_paginator, 0.2);',
                'new PeriodicalExecuter(necromancy_observer, 0.02);',
                'void 0;'].join('');

            execClient(cmd, 400);
        },
    });
}

function main() {
    buildMainPage();
}

function isExecPage() {
    if (/^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location) /* for Opera */ &&
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
    if (isExecPage()) {
        main();
    }
}
else {
    window.document.addEventListener('DOMContentLoaded', main, false);
}

