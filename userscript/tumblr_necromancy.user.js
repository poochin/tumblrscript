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

/*
<li id="post_22378621819" class="post with_permalink quote is_reblog not_mine">
  <div class="corner_mask"></div>
  <!-- Post controls -->
  <div class="post_controls">
    <a href="#" id="show_notes_link_22378621819" class="reblog_count" onclick="display_post_notes(22378621819, 's4JimKT88'); return false;">
      <span id="note_link_less_22378621819" style="display:none;" title="230 notes">230</span>
      <span id="note_link_current_22378621819" title="231 notes">231</span>
      <span id="note_link_more_22378621819" style="display:none;" title="230 notes">232</span>
    </a>
    <a class="reblog_button" title="Reblog" data-fast-reblog-url="/fast_reblog/22378621819/wJqxQ8RO" href="/reblog/22378621819/wJqxQ8RO?redirect_to=%2Fdashboard"></a>
    <form action="/like/wJqxQ8RO" method="post" id="like_form_22378621819" style="display:none;">
      <input type="hidden" name="id" value="22378621819" />
      <input type="hidden" id="form_key" name="form_key" value="LaDfhtaPy4n7BNZ6In6uDrUC8" />
    </form>
    <a class="like_button  like_root_14221399396" href="#" title="Like" id="like_button_22378621819" data-root-post-id="14221399396" onclick="submit_like('22378621819'); _gaq.push(['_trackEvent', 'Dashboard', 'Like', 'Post: 22378621819']); return false;"></a>
  </div>
  <!-- Username -->
  <div class="post_info">
    <a href="http://igi.tumblr.com">igi</a>reblogged<a href="http://katoyuu.tumblr.com/post/22378549055/2ch">katoyuu</a>:
  </div>
  <!-- Reply pane -->
  <div id="reply_pane_outer_container_22378621819" style="clear:both; display:none"></div>
  <!-- Share post -->
  <div class="post_content" id="post_content_22378621819">“
    <span class="quote">未だに2chにいるひとたち、他人のブログのコメント欄で日記を書く人たち、ティーカップ掲示板で交換日記を書くカップル、Yahoo知恵袋で日記を書く人たち。「自分の場所を作るという努力をしてこなかった」ありとあらゆる人たち、デジタルアイデンティティを確立させようという努力を放棄してきた人たち。彼らは仮住まいの、他人の作った書き込み領域に居候することで、意図的に他者との境界線を曖昧にする。おそらくプログラミングが出来なかったら、自分もそうしていただろう。</span>”
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">
      <tbody>
        <tr>
          <td valign="top" style="width:1px; padding:0px 10px 0px 20px;">—</td>
          <td valign="top" class="quote_source">
            <p><a href="http://mala.hateblo.jp/entry/2011/12/14/121139" target="_blank">はてな使ったら負けかなと思っている2011 - mala’s blog</a> (via <a href="http://otsune.tumblr.com/" target="_blank">otsune</a>)</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="clear"></div>
  <div class="footer_links  with_source_url">
    <span class="source_url" id="source_url_22378621819">
      <a href="http://mala.hateblo.jp/entry/2011/12/14/121139">
        Source: mala.hateblo.jp
        <div class="source_url_gradient"></div>
      </a>
    </span>
  </div>
  <div id="notes_outer_container_22378621819" style="display:none; overflow:hidden; clear:both;">
    <div style="padding-top:10px;">
      <div id="notes_container_22378621819" style="display:none; overflow:hidden;"></div>
      <div id="notes_control_22378621819" class="notes_control">
        <div id="notes_loader_22378621819" class="notes_loader">Loading...</div>
        <div id="notes_hide_link_22378621819" style="display:none;" class="notes_hide_link">
          <a href="#" onclick="Effect.SlideUp('notes_outer_container_22378621819'); return false;" style="color:#79A0BE;">
            Hide notes
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="avatar_and_i">
    <a href="http://igi.tumblr.com" title="igi/Tumblr" class="post_avatar" id="post_avatar_22378621819" style="background-image:url('http://27.media.tumblr.com/avatar_afa954af703d_64.png')"></a>
      <div class="user_menu_info_button">
        <div class="user_menu_info"></div>
        <div class="user_menu popover" id="user_menu_22378621819" style="display:none">
        <div class="user_menu_nipple"></div>
        <div class="user_menu_list">
          <a href="/send/igi" onclick="if (typeof show_fan_mail_lightbox == 'function') { show_fan_mail_lightbox(this); return false; }">
            <div class="user_menu_list_item">
              <span class="user_menu_icon fan_mail"></span>Fan Mail
            </div>
          </a>
          <a href="/follow/igi" following="true" class="user_menu_item_toggle_following_b56a214222a8420e90df549beeee95b5" onclick="user_menu_toggle_following('b56a214222a8420e90df549beeee95b5', 'LaDfhtaPy4n7BNZ6In6uDrUC8', 'igi'); return false;">
            <div class="user_menu_list_item user_menu_list_item_follow_b56a214222a8420e90df549beeee95b5" style="display:none">
              <span class="user_menu_icon follow"></span>
              Follow
            </div>
            <div class="user_menu_list_item user_menu_list_item_unfollow_b56a214222a8420e90df549beeee95b5" style="display:block">
              <span class="user_menu_icon unfollow"></span>
              Unfollow
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <span class="arrow"></span>
  <a href="http://igi.tumblr.com/post/22378621819/2ch" title="View post - 9:02pm"class="permalink" id="permalink_22378621819"></a>
</li>
*/



/* APIv2で取得したJSONデータのうち post の部分で .post を作成します */
function buildSimilarPost(json) {
    /* TODO: 先に post_content 以外の全ポスト共通の node 作成を行います */

    /* FIXME: is_mine, not_mine は付けていません */
    var post = buildElement('li', {id: 'post_' + json.id});
    post.className = [
        'post',
        json.type,
        (json.reblogged_from_name ? 'is_reblog' : '')].join(' ');  /* FIXME: is_reblog not(is)_mine */

    /* 謎要素です */
    post.appendChild(buildElement('div', {class: 'corner_mask'}));

    /* notes, Reblog, Like など */
    var post_controls = buildElement('div', {class: 'post_controls'});

    /* post_controls > notes */
    var notes = buildElement('a', {
        href: '#',
        id: 'show_notes_link_' + json.id,
        class: 'reblog_count',
        /* FIXME: 実は reblog_key ではない */
        onclick: 'display_post_notes(' + (json.id) + ', \'' + (json.reblog_key) + '\'); return false;'});
    notes.appendChild(buildElement('span', {
                id: 'note_link_less_' + json.id, style: 'display:none;', title: (json.note_count - 1)+ ' notes'},
            json.note_count - 1));
    notes.appendChild(buildElement('span', {
                id: 'note_link_current_' + json.id, title: (json.note_count) + ' notes'},
            json.note_count));
    notes.appendChild(buildElement('span', {
                id: 'note_link_more_' + json.id, style: 'display:none;', title: (json.note_count + 1)+ ' notes'},
            json.note_count + 1));

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
    /* FIXME: Like は動きません */
    var like_form = buildElement('form', {
        method: 'post',
        action: ['/like', json.reblog_key].join('/'),
        id: 'like_form_' + json.id,
        style: 'display: none'});
    like_form.appendChild(buildElement('input', {type: 'hidden', name: 'id', value: json.id}));
    like_form.appendChild(buildElement('input', {type: 'hidden', id: 'form_key', name: 'form_key', value: json.reblog_key})); /* FIXME: 実は reblog_key ではない */

    post_controls.appendChild(like_form);

    var like_button = buildElement('a', {
        class: 'like_button like_root_' + json.reblogged_root_url.match(/post\/(\d+)/)[1],
        href: '#',
        title: 'like',
        id: 'like_button_' + json.id,
        'data-root-post-id': json.reblogged_root_url.match(/post\/(\d+)/)[1],
        onclick: 'submit_like(\'' + (json.id) + '\'); return false;'});

    post_controls.appendChild(like_button);

    post.appendChild(post_controls);

    /* FIXME: reblogged you の際にリンクを付けない */
    var post_info = buildElement('div', {class: 'post_info'});
    post_info.innerHTML = [
        '<a href="http://', json.blog_name, '/">',
        json.blog_name,
        '</a> reblogged ',
        '<a href="', json.reblogged_from_url, '">',
        json.reblogged_from_name,
        '</a>:'].join('');

    post.appendChild(post_info);
        
    /* 謎要素です */
    post.appendChild(buildElement('div', {id: 'reply_pane_outer_container_' + json.id, style: 'clear:both; display:none;'}));



/*
<div class="post_content" id="post_content_22446898592" style="clear: both; ">
    <img class="image_thumbnail enlarged" alt="" id="thumbnail_photo_22446898592"
    onclick="
                                                    if (this.src.indexOf('_100') != -1) { this.style.backgroundColor = 'transparent'; this.src='http://24.media.tumblr.com/tumblr_m3k0ks329P1qz6ycco1_400.jpg'; }
                                        
                                                    if ($(this).hasClassName('enlarged')) {
                                                        this.style.width = '150px';
                                                        this.style.height = '228px';
                                                        $(this).removeClassName('enlarged');
                                                        if ($('photo_info_22446898592')) $('photo_info_22446898592').hide();
                                                        if ($('photo_exif_flipper_22446898592')) $('photo_exif_flipper_22446898592').hide();
                                                        $('post_content_22446898592').style.clear = 'none';
                                                    } else {
                                                        $('post_content_22446898592').style.clear = 'both';
                                                        if ($('photo_info_22446898592')) $('photo_info_22446898592').show();
                                                        if ($('photo_exif_flipper_22446898592')) $('photo_exif_flipper_22446898592').show();
                                                        this.style.width = '300px';
                                                        this.style.height = '455px';
                                                        $(this).addClassName('enlarged');
                                                    }
                                                    this.blur();
                                                    return false;
                                                " style="cursor: pointer; background-color: transparent; width: 300px; height: 455px; "
    width="150" height="228" src="http://24.media.tumblr.com/tumblr_m3k0ks329P1qz6ycco1_400.jpg"
    onload="if (this.src.indexOf('_100') != -1) { this.style.backgroundColor = 'transparent'; this.src='http://24.media.tumblr.com/tumblr_m3k0ks329P1qz6ycco1_400.jpg'; }">
    <div id="photo_info_22446898592" style="font-size: 10px; line-height: 20px; clear: both; height: 27px; ">
        <a href="http://matome.naver.jp/odai/2133057962303696401">matome.naver.jp</a>→</div>
    <div class="caption" style="margin-top:0px;">
        <p>
            <a href="http://ultramarine.tumblr.com/post/22446464065/tumblr-naver">ultramarine</a>:</p>
        <blockquote>
            <p>
                <a href="http://matome.naver.jp/odai/2133057962303696401">【笑ったら負け】Tumblrのダッシュボードで起きた奇跡の瞬間まとめ - NAVER まとめ</a>
            </p>
        </blockquote>
    </div>
</div>
*/

    /* <div class="post_content" id="post_content_22378621819">“  */
    /* FIXME: 後回しにします */
    var post_content = buildElement('div', {class: 'post_content', id: 'post_content_' + json.id, style: 'clear: both;'});
    var post_image = buildElement('img', {
        class: 'image_thumbnail',
        id: 'thumbnail_photo_' + json.id,
        width: json.photos[0].alt_sizes[3].width,
        height: json.photos[0].alt_sizes[3].height,
        src: json.photos[0].alt_sizes[3].url}); /* FIXME: 色々とごまかして作ってあります */
    var post_caption = buildElement('div', {class: 'caption', style: 'margin-top:0px;'}, json.caption);

    post_content.appendChild(post_image);
    post_content.appendChild(post_caption);


    post.appendChild(post_content);

    /* 多分 clearfix です*/ 
    post.appendChild(buildElement('div', {class: 'clear'}));

    /* <div class="footer_links  with_source_url"> */
    /* FIXME: with_source_url の付帯条件 */
    var footer_links = buildElement('div', {class: 'footer_links with_source_url'});
    var source_url = buildElement('span', {id: 'source_url_' + json.id});
    source_url.appendChild(buildElement('a', {href: json.source_url}, 'Source: ' + json.source_title));
    source_url.appendChild(buildElement('div', {class: 'source_url_gradient'}));
    footer_links.appendChild(source_url);

    post.appendChild(footer_links);

    /* <div id="notes_outer_container_22378621819" style="display:none; overflow:hidden; clear:both;"> */
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

    post.appendChild(notes_outer_container);

    /* <div class="avatar_and_i"> */
    /* FIXME: ノードが足りてません */
    /* FIXME: アバターが表示されません */
    var avater_and_i = buildElement('div', {class: 'avater_and_i'});
    var post_avater = buildElement('a', {
        href: 'http://' + json.blog_name + '.tumblr.com/',
        title: '???', /* FIXME */
        class: 'post_avater',
        id: 'post_avater_' + json.id,
        style: 'background-image:url(\'http://api.tumblr.com/v2/blog/'+(json.blog_name)+'.tumblr.com/avatar/64\');'});

    avater_and_i.appendChild(post_avater);

    post.appendChild(avater_and_i);

    /* arrow */
    post.appendChild(buildElement('span', {class: 'arrow'}));

    /* dog ear? */
    post.appendChild(buildElement('a', {
        href: json.post_url,
        title: 'view post - ???', /* FIXME */
        class: 'permalink',
        id: 'permalink_' + json.id}));

    return post;
}

function necromancy_callback(json) {
    var posts = document.querySelector('#posts');
    json.response.posts.map(function(json_post) {
        /* FIXME: 便宜的に console と例外でくくっています。 終わったら外しましょう。*/
        console.log(json_post);
        try{
            posts.appendChild(buildSimilarPost(json_post));
        } catch (e) { }
    });
    window.loading_next_page = false;

    var next_page_parsed = window.next_page.match(/\/blog\/(?:([^\/]+)\/?)(?:([a-z\-_]+)\/?)?(?:(\d+)\/?)?$/);
    var tumblelog = next_page_parsed[1];
    var type = next_page_parsed[2] || '';
    var offset = parseInt(next_page_parsed[3]);
    var cur_url = [
        'http://www.tumblr.com/blog',
        tumblelog,
        type,
        (offset || 0)].join('/');
    history.pushState('', '', cur_url);
    window.next_page = [
        '/blog',
        tumblelog,
        type,
        (offset || 0) + 10].join('/');
    console.log(window.next_page);
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
    /*
    var posts;
        loading_next_page = true;
        $('auto_pagination_loader_loading').show();
        $('auto_pagination_loader_failure').hide();
        new Ajax.Request(next_page + (next_page.indexOf('?') == -1 ? '?lite' : ''), {
            onFailure: function () {
                new Ajax.Request(next_page + (next_page.indexOf('?') == -1 ? '?lite' : ''), {
                    onFailure: function () {
                        _give_up_on_auto_paginator()
                    },
                    onComplete: function (transport) {
                        if (200 == transport.status) {
                            _process_auto_paginator_response(transport)
                        }
                    }
                })
            },
            onComplete: function (transport) {
                if (200 == transport.status) {
                    _process_auto_paginator_response(transport)
                }
            }
        })
    }
    */
    /* window.next_page Ajax.Request を使用して次ページを取得し、_process_auto_paginator_response に処理を投げます */
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
            var posts = elm_body.querySelectorAll('#posts>.post:not(.new_post)');
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
                necromancy_paginator.toString(),
                necromancy_callback.toString(),
                buildQueryString.toString(),
                buildElement.toString(),
                buildSimilarPost.toString(),
                'new PeriodicalExecuter(necromancy_paginator, 0.2);'].join(''), 1000);
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

