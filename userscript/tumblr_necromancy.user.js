// ==UserScript==
// @name        Tumblr NecromancyJS
// @match       http://www.tumblr.com/blog/*
// @version     1.0.0
// @description 他人の tumblelog を自分の blog ページの様に表示させます
// 
// @author      poochin
// @license     MIT
// @updated     2012-05-02
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/.*
// ==/UserScript==



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
            if (xhr.status == 200) {
                if (options.onSuccess) {
                    options.onSuccess(xhr);
                }    
            }    
            else {
                /* FIXME: エラーを具体的に分ける */
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

function htmlToSafe(html) {
    /* TODO: <scrip> タグが動かないようにします */
    /* TODO: onclick などを削除します */
    /* node.attributes[0] */
    return html.replace('<script', '&ltscript');
}

function trimNodeEvent(node) {
    var attributes = node.attributes;
    for (var i = 0; i < attributes.length; ++i) {
        if (/^on/.test(attributes[i].name)) {
            node.removeAttribute(attributes[i].name);
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
    node.removeAttribute('style');
    if (node.childNodes) {
        for (var i = 0; i < node.children.length; ++i) {
            trimNodeStyle(node.children.item(i));
        }
    }
}

function buildPostControls(json) {
    var post_controls = buildElement('div', {class: 'post_controls'});

    /* post_controls > notes */
    var notes = buildElement('a', {
        href: '#',
        id: 'show_notes_link_' + json.id,
        class: 'reblog_count',
        onclick: 'display_post_notes(' + (json.id) + ', \'' + (json.reblog_key) + '\'); return false;'});
    /* FIXME: onclick の部分、実は reblog_key ではない!! */

    var note_count = parseInt(json.note_count);
    notes.appendChild(buildElement('span', {
        id: 'note_link_less_' + json.id, style: 'display:none;', title: (note_count - 1)+ ' notes'}, note_count - 1));
    notes.appendChild(buildElement('span', {
        id: 'note_link_current_' + json.id, title: (note_count) + ' notes'}, note_count));
    notes.appendChild(buildElement('span', {
        id: 'note_link_more_' + json.id, style: 'display:none;', title: (note_count + 1)+ ' notes'}, note_count + 1));

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
    like_form.appendChild(buildElement('input', {type: 'hidden', name: 'id', value: json.id}));
    like_form.appendChild(buildElement('input', {type: 'hidden', id: 'form_key', name: 'form_key', value: LIKE_KEY}));

    post_controls.appendChild(like_form);

    var root_id = (json.reblogged_root_url ? json.reblogged_root_url.match(/post\/(\d+)/)[1] : '');
    var like_button = buildElement('a', {
        class: 'like_button like_root_' + root_id,
        href: '#',
        title: 'like',
        id: 'like_button_' + json.id,
        'data-root-post-id': root_id,
        onclick: 'submit_like(\'' + (json.id) + '\'); return false;'});

    post_controls.appendChild(like_button);
    return post_controls;
}


function buildPostInfo(json) {
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
}

function buildContentOfPhoto(json) {
    var frag = document.createDocumentFragment();

    var highres = json.photos[0].alt_sizes[0];
    var minres = json.photos[0].alt_sizes.slice(-2)[0];
    var midres = json.photos[0].alt_sizes[1];
    var width150 = '150px';
    var height150 = (150 * parseFloat(highres.height) / parseFloat(highres.width)) + 'px';
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
        "    this.style.width = '" + (width150) + "';",
        "    this.style.height = '" + (height150) + "';",
        "    $(this).removeClassName('enlarged');",
        "    if ($('photo_info_" + (json.id) + "')) $('photo_info_" + (json.id) + "').hide();",
        "    if ($('photo_exif_flipper_" + (json.id) + "')) $('photo_exif_flipper_" + (json.id) + "').hide();",
        "    $('post_content_" + (json.id) + "').style.clear = 'none';",
        "} else {",
        "    $('post_content_" + (json.id) + "').style.clear = 'both';",
        "    if ($('photo_info_" + (json.id) + "')) $('photo_info_" + (json.id) + "').show();",
        "    if ($('photo_exif_flipper_" + (json.id) + "')) $('photo_exif_flipper_" + (json.id) + "').show();",
        "    this.style.width = '" + (width500) + "px';",
        "    this.style.height = '" + (height500) + "px';",
        "    $(this).addClassName('enlarged');",
        "}",
        "this.blur();",
        "return false;"].join('');

    var style = 'cursor: pointer; background-color: transparent; width: ' + (width150) + '; height: ' + (height150) + '; ';

    var post_image = buildElement('img', {
        class: 'image_thumbnail',
        id: 'thumbnail_photo_' + json.id,
        src: minres.url,
        style: style,
        onclick: onclick,
        onload: onload});

    frag.appendChild(post_image);
    frag.appendChild(document.createTextNode(' '));


    if (json.link_url) {
        var post_info = buildElement('div', {id: 'photo_info_' + (json.id),
            style: 'display:none; margin-top: 2px; font-size:10px; line-height:20px; clear:both; height:27px;'});
        post_info.appendChild(buildElement('a', {href: json.link_url}, json.link_url.match(/http:\/\/([^\/]+)/)[1]));
        post_info.appendChild(document.createTextNode(' → '));
    
        frag.appendChild(post_info);
    }

    if (json.caption) {
        /* FIXME: json.caption の安全性のチェックを行なっていません */
        var post_caption = buildElement('div', {class: 'caption', style: 'margin-top:0px;'}, json.caption);
        frag.appendChild(post_caption);
    }

    return frag;
}

function buildContentOfText(json) {
    var frag = document.createDocumentFragment();

    if (json.title) {
        /* FIXME: 安全性を確保していません */
        var post_title = buildElement('div', {class: 'post_title'}, json.title);
        trimNodeStyle(post_title);
        frag.appendChild(post_title);
    }

    if (json.body) {
        /* FIXME: 安全性を確保していません */
        /* FIXME: body が手に入りません */
        var post_body_outer = buildElement('div', {}, json.body);
        for (var i = 0; i < post_body_outer.children.length; ++i) {
            frag.appendChild(post_body_outer.children.item(i));
        }
    }
    return frag;
}

function buildContentOfQuote(json) {
    var frag = document.createDocumentFragment();

    if (json.text) {
        frag.appendChild(document.createTextNode('“'));

        var quote = buildElement('span', {class: 'quote'}, htmlToSafe(json.text));
        trimNodeEvent(quote);
        trimNodeStyle(quote);
        frag.appendChild(quote);

        frag.appendChild(document.createTextNode('”'));
    }

    if (json.source) {
        /* FIXME: 安全性を確保していません */
        var table = buildElementBySource([
            '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">',
            '    <tbody>',
            '        <tr>',
            '            <td valign="top" style="width:1px; padding:0px 10px 0px 20px;">—</td>',
            '            <td valign="top" class="quote_source"></td>',
            '        </tr>',
            '    </tbody>',
            '</table>'].join(''));
        table.querySelector('.quote_source').innerHTML = json.source;
        frag.appendChild(table);
    }

    return frag;
}

function buildContentOfLink(json) {
    var frag = document.createDocumentFragment();

    if (json.title) {
        var post_title = buildElement('div', {class: 'post_title'});
        var link_title = buildElement('a', {href: json.url}, json.title);
        trimNodeStyle(link_title);
        post_title.appendChild(link_title);
        frag.appendChild(post_title);

    }

    if (json.description) {
        var link_description = buildElement('div', {style: 'margin-top: 10px;'}, htmlToSafe(json.description));
        trimNodeEvent(link_description);
        trimNodeStyle(link_description);
        frag.appendChild(link_description);
    }

    return frag;
}

function buildContentOfAnswer(json) {
    var frag = document.createDocumentFragment();
    /* これは何……？ */
    return frag;
}

function buildContentOfVideo(json) {
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
    frag.appendChild(thumbnail);

    /* javascript: cycle_video_thumbnail */

    if (json.player.length) {
        var watch_video = buildElement('div', {
            id: 'watch_video_' + json.id,
            class: 'video',
            style: 'display:none;'});
    
        var outer_click = buildElement('div', {style: 'font-size:10px; line-height:20px; clear:both; height:27px;'});
        outer_click.appendChild(buildElement('a', {href: '#', onclick: 'toggle_video_embed(' + (json.id) + '); return false;'}, 'Hide video'));
    
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
        /* FIXME: 安全性は確保していません */
        var caption = buildElement('div', {class: 'caption'}, json.caption);

        frag.appendChild(caption);
    }

    return frag;
}

function buildContentOfAudio(json) {
    var frag = document.createDocumentFragment();

    if (json.album_art) {
        /* Album art */
        var album_art = buildElement('img', {
            class: 'album_art',
            alt: '',
            onclick: "$(this).toggleClassName('album_art'); return false;",
            title: json.track_name,
            src: json.album_art});

        frag.appendChild(album_art);
    }

    if (json.audio_url) {
        /* non-Flash info */
        var noflash = buildElement('span', {id: 'audio_node_' + json.id}, '[<a href="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" target="_blank">Flash 9</a>is required to listen to audio.]');

        frag.appendChild(noflash);

        /* Audio script */
        var audio_script = buildElement('script', {type: 'text/javascript'}, [
            "replaceIfFlash(9, 'audio_node_" + (json.id) + "', ",
            "'<div>", json.player,  "</div>');"].join(''));

        frag.appendChild(audio_script);
    }

    return frag;
}

function buildContentOfChat(json) {
    var frag = document.createDocumentFragment();

    if (json.title) {
        /* FIXME: タイトルは未実装です */
    }

    if (json.body) {
        var conversation_lines = buildElement('ul', {class: 'conversation_lines'});

        json.body.split('\n').map(function(line) {
            if (line.trim() == '') {
                return;
            }
            var li = buildElement('li', {class: 'chat_line'});
            var sp = line.split(':');
            li.innerHTML = [
                '<strong>',
                sp[0].replace('<', '&lt;'),
                ':</strong>',
                (sp[1] || '').replace('<', '&lt;')].join('');
            conversation_lines.appendChild(li);
        });

        frag.appendChild(conversation_lines);
    }

    return frag;

/*
<div class="post_content" id="post_content_22511400093">
    <ul class="conversation_lines">
        <li class="chat_line">
            <strong>me (surprised):</strong>omg</li>
        <li class="chat_line">
            <strong>me (amused):</strong>omg</li>
        <li class="chat_line">
            <strong>me (angry):</strong>omg</li>
        <li class="chat_line">
            <strong>me (sad):</strong>omg</li>
        <li class="chat_line">
            <strong>me (nostalgic):</strong>omg</li>
        <li class="chat_line">
            <strong>me (annoyed):</strong>omg</li>
        <li class="chat_line">
            <strong>me (scared):</strong>omg</li>
    </ul>
</div>
*/
}

function buildPostContent(json) {
    /* FIXME: source, caption の html が安全かどうか確認していません */
    /* FIXME: type ごとに表示を分ける */
    var post_content = buildElement('div', {class: 'post_content', id: 'post_content_' + json.id, style: 'clear: both;'});
    /* TODO: switch を if 文に変える */
    switch (json.type) {
        case 'text': {
            post_content.appendChild(buildContentOfText(json));
            break;
        }
        case 'quote': {
            post_content.appendChild(buildContentOfQuote(json));
            break;
        }
        case 'link': {
            post_content.appendChild(buildContentOfLink(json));
            break;
        }
        case 'answer': {
            post_content.appendChild(buildContentOfAnswer(json));
            break;
        }
        case 'video': {
            post_content.appendChild(buildContentOfVideo(json));
            break;
        }
        case 'audio': {
            post_content.appendChild(buildContentOfAudio(json));
            break;
        }
        case 'chat': {
            post_content.appendChild(buildContentOfChat(json));
            break;
        }
        case 'photo': {
            post_content.appendChild(buildContentOfPhoto(json));
            break;
        }
        default: {
            break;
        }
    }
    return post_content;
}

function buildFooterLinks(json) {
    /* FIXME: with_source_url の付帯条件 */
    if (!json.source_url) {
        return null;
    }
    var footer_links = buildElement('div', {class: 'footer_links with_source_url'});
    var source_url = buildElement('span', {id: 'source_url_' + json.id, class: 'source_url'});
    source_url.appendChild(buildElement('a', {href: json.source_url}, 'Source: ' + json.source_title));
    source_url.appendChild(buildElement('div', {class: 'source_url_gradient'}));
    footer_links.appendChild(source_url);

    return footer_links;
}

function buildNotesOuterContainer(json) {
    var notes_outer_container = buildElement('div', {id: 'notes_outer_container_' + json.id, style: 'display:none; overflow:hidden; clear:both;'});
    var notes_outer_container_inner = buildElement('div', {style: 'padding-top:10px;'});
    var notes_container = buildElement('div', {id: 'notes_container_' + json.id, style: 'display:none; overflow:hidden;'});
    var notes_control = buildElement('div', {id: 'notes_control_' + json.id, class: 'notes_control'});
    var notes_loader = buildElement('div', {id: 'notes_loader_' + json.id, class: 'notes_loader'}, 'Loading...');
    var notes_hide_link = buildElement('div', {id: 'notes_hide_link_' + json.id, style: 'display:none;', class: 'notes_hide_link'});
    var notes_hide_alink = buildElement('a', {href: '#', onclick: 'Effect.SlideUp(\'notes_outer_container_' + (json.id) + '\'); return false;', style: 'color:#79A0BE;'}, 'Hide notes');

    notes_outer_container.appendChild(notes_outer_container_inner);
    notes_outer_container_inner.appendChild(notes_container);
    notes_outer_container_inner.appendChild(notes_control);
    notes_control.appendChild(notes_loader);
    notes_control.appendChild(notes_hide_link);
    notes_hide_link.appendChild(notes_hide_alink);

    return notes_outer_container;
}

function buildAvatarAndI(json) {
    /* FIXME: ノードが足りてません */
    var avatar_and_i = buildElement('div', {class: 'avatar_and_i'});
    var post_avatar = buildElement('a', {
        href: 'http://' + json.blog_name + '.tumblr.com/',
        title: '???', /* FIXME */
        class: 'post_avatar',
        id: 'post_avatar_' + json.id,
        style: 'background-image:url(\'http://api.tumblr.com/v2/blog/'+(json.blog_name)+'.tumblr.com/avatar/64\');'});

    avatar_and_i.appendChild(post_avatar);
    return avatar_and_i;
}

function buildPostPermalink(json) {
    return buildElement('a', {
        href: json.post_url,
        title: 'view post - ???', /* FIXME */
        class: 'permalink',
        id: 'permalink_' + json.id});
}

/* APIv2で取得したJSONデータのうち post の部分で .post を作成します */
function buildSimilarPost(json) {
    /* FIXME: is_mine, not_mine は付けていません */
    var post = buildElement('li', {id: 'post_' + json.id});
    post.className = [
        'post',
        json.type,
        (json.reblogged_from_name ? 'is_reblog' : '')].join(' ');  /* FIXME: is_reblog not(is)_mine */

    /* 謎要素です */
    post.appendChild(buildElement('div', {class: 'corner_mask'}));

    /* notes, Reblog, Like など */
    var post_controls = buildPostControls(json);
    post.appendChild(post_controls);

    /* A reblogged B: */
    var post_info = buildPostInfo(json);
    post.appendChild(post_info);

    /* 謎要素です */
    post.appendChild(buildElement('div', {id: 'reply_pane_outer_container_' + json.id, style: 'clear:both; display:none;'}));

    /* 各 type のポストコンテンツです */
    var post_content = buildPostContent(json);
    post.appendChild(post_content);

    /* 多分 clearfix です*/ 
    post.appendChild(buildElement('div', {class: 'clear'}));

    /* <div class="footer_links  with_source_url"> */
    var footer_links = buildFooterLinks(json);
    if (footer_links) {
        post.appendChild(footer_links);
    }

    /* Notes 一覧 */
    var notes_outer_container = buildNotesOuterContainer(json);
    post.appendChild(notes_outer_container);

    /* avatar アイコン */
    var avatar_and_i = buildAvatarAndI(json);
    post.appendChild(avatar_and_i);

    /* arrow */
    post.appendChild(buildElement('span', {class: 'arrow'}));

    /* 右上に出る折れる Permalink */
    post.appendChild(buildPostPermalink(json));

    return post;
}

function buildNecromancyURL(tumblelog, type, offset) {
    var url = ['http://www.tumblr.com/blog'];

    if (tumblelog)           url.push(tumblelog);
    if (type)                url.push(type);
    if (offset != undefined) url.push(offset);

    return url.join('/');
}

function necromancy_callback(json) {
    console.log(json.response);
    var posts_node = document.querySelector('#posts');
    var posts = json.response.posts.map(function(json_post) {
        /* FIXME: 便宜的に console と例外でくくっています。 終わったら外しましょう。*/
        /* console.log(json_post); */
        var post = buildSimilarPost(json_post);
        post.className += ' same_user_as_last';
        return posts_node.appendChild(post);
    });
    posts[0].className = posts[0].className.replace(' same_user_as_last');
    
    window.loading_next_page = false;

    var next_page_parsed = window.next_page.match(/\/blog\/(?:([^\/]+)\/?)(?:([a-z\-_]+)\/?)?(?:(\d+)\/?)?$/);
    var tumblelog = next_page_parsed[1];
    var type = next_page_parsed[2] || '';
    var offset = parseInt(next_page_parsed[3]);

    var cur_url = buildNecromancyURL(tumblelog, type, offset || 0);
    history.pushState('', '', cur_url);

    window.next_page = buildNecromancyURL(tumblelog, type, (offset || 0) + 10);
    window.loading_next_page = false;
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
    if ((posts = $$('#posts > li')) && posts[posts.length - 1].positionedOffset().top - (document.viewport.getDimensions().height + document.viewport.getScrollOffsets().top) < 300) {
        window.loading_next_page = true;

        var next_page_parsed = window.next_page.match(/\/blog\/(?:([^\/]+)\/?)(?:([a-z\-_]+)\/?)?(?:(\d+)\/?)?$/);
        var tumblelog = next_page_parsed[1];
        var type = next_page_parsed[2] || '';
        var offset = parseInt(next_page_parsed[3]);

        var url = [
            'http://api.tumblr.com/v2/blog',
            tumblelog,
            'posts',
             type +  '?' + buildQueryString({limit: 10, api_key: API_KEY, reblog_info: 'true', offset: offset, jsonp: 'necromancy_callback'})].join('/');

        var script = buildElement('script', {src: url});
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

            var lang_script = buildElement('script', {src: 'http://assets.tumblr.com/languages/strings/en_US.js?838'});
            var dsbd_script = buildElement('script', {src: 'http://assets.tumblr.com/javascript/prototype_effects_application_tumblelog.js?838'});
            var apikey_script = buildElement('script', {}, 'var API_KEY = "lu2Ix2DNWK19smIYlTSLCFopt2YDGPMiESEzoN2yPhUSKbYlpV";');
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

            var url = 'http://api.tumblr.com/v2/blog/poochin.tumblr.com/posts?reblog_info=true&api_key=kgO5FsMlhJP7VHZzHs1UMVinIcM5XCoy8HtajIXUeo7AChoNQo';

            execClient([
                'start_observing_key_commands(1);',
                'initialize_tabs();',
                'window.next_page = location.href;',
                'window.LIKE_KEY = "' + like_key + '";',
                htmlToSafe.toString(),
                trimNodeEvent.toString(),
                trimNodeStyle.toString(),
                necromancy_paginator.toString(),
                necromancy_callback.toString(),
                buildQueryString.toString(),
                buildElement.toString(),
                buildElementBySource.toString(),
                buildNecromancyURL.toString(),
                buildSimilarPost.toString(),
                buildPostControls.toString(),
                buildPostInfo.toString(),
                buildPostContent.toString(),
                buildContentOfText.toString(),
                buildContentOfQuote.toString(),
                buildContentOfLink.toString(),
                buildContentOfAnswer.toString(),
                buildContentOfVideo.toString(),
                buildContentOfAudio.toString(),
                buildContentOfPhoto.toString(),
                buildContentOfChat.toString(),
                buildFooterLinks.toString(),
                buildNotesOuterContainer.toString(),
                buildAvatarAndI.toString(),
                buildPostPermalink.toString(),
                'new PeriodicalExecuter(necromancy_paginator, 0.2); void 0;'].join(''), 400);
        },
    });
}

function main() {
    buildMainPage();
}

function isExecPage() {
    if (/^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location) /* for Opera */ &&
        /<script type="text\/javascript" language="javascript">var status_code = '(403|404)'<\/script>/.test(document.documentElement.innerHTML)) {
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

