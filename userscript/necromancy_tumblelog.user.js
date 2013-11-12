// ==UserScript==
// @name        Necromancy Tumblelog
// @namespace   https://github.com/poochin
// @include     http://www.tumblr.com/dashboard?tumblelog/*
// @include     http://*.tumblr.com/
// @version     1.2.0.6
// @description 他人の tumblelog を自分の blog ページの様に表示させます
//
// @author      poochin
// @license     MIT
// @updated     2012-12-05
// @namespace   NecromancyTumblelog
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/necromancy_tumblelog.user.js
// ==/UserScript==

/**
 * @namespace NecromancyTumblelog
 * @TODO ランダム機能を付けます
 * @TODO quote_body の h2 などを取り除くようにします
 * @TODO font タグを除去します
 */
(function NecromancyTumblelog() {
    var Necro = {};

    var Vals = Necro.vals = {};
    var Etc = Necro.etc = {};

    Vals.API_KEY = 'lu2Ix2DNWK19smIYlTSLCFopt2YDGPMiESEzoN2yPhUSKbYlpV';
    Vals.LOAD_SCROLL_OFFSET = 5000;

    Vals.tumblelog_observers = [];

    Vals.browser =
        ( window.opera                                ? 'opera'
        : window.navigator.userAgent.match(/Chrome/)  ? 'chrome'
        : window.navigator.userAgent.match(/Firefox/) ? 'firefox'
                                                      : '');

    Vals.tag = "";
    Vals.type = "";
    Vals.is_random = false;
    Vals.is_list = false;
    Vals.offset = 0;

    Vals.total_posts = 0;

    Vals.next_page = null;
    Vals.loading_next_page = false;
    Vals.pagenator_interval_id = null;

    /**
     *  /blog/
     *    blog_name
     *      tag
     *        type
     *          random
     *          offset
     */
    Vals.PATH_PARSER = 
        /\/dashboard\?tumblelog\/(?:([a-z0-9\-_.]+)\/?)(?:tag\/([^\/]+)\/?)?(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+|random)\/?)?$/;
    // Vals.PATH_PARSER = 
    //     /\/blog\/(?:([a-z0-9\-_.]+)\/?)(?:tag\/([^\/]+)\/?)?(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+|random)\/?)?$/;

    Etc.preapply = function preapply(self, func, args) {
        return function() {
            func.apply(self, (args || []).concat(Array.prototype.slice.call(arguments)));
        };
    };

    Vals.post_template_head = 
            ["<li class=\"post_container\">",
            "    <div class=\"post post_full is_<%=(type==\"text\"?\"regular\":type==\"chat\"?\"conversation\":type)%> post_tumblelog_nohash is_mine is_original with_permalink no_notes\" id=\"post_<%=id%>\" data-post-id=\"<%=id%>\" data-root-id=\"<%=root_id%>\" data-tumblelog-name=\"<%=blog_name%>\" data-tumblelog-key=\"___\"",
            "    data-reblog-key=\"<%=reblog_key%>\" data-type=\"<%=type%>\" data-json=\"{&quot;post-id&quot;:<%=id%>,&quot;root-id&quot;:<%=root_id%>,&quot;tumblelog-name&quot;:&quot;<%=blog_name%>&quot;,&quot;tumblelog-key&quot;:&quot;___&quot;,&quot;reblog-key&quot;:&quot;<%=reblog_key%>&quot;,&quot;type&quot;:&quot;<%=type%>&quot;}\">",
            "        <div class=\"post_avatar  faded_sub_avatar\">",
            "            <a class=\"post_avatar_link\" href=\"http://<%=blog_name%>.tumblr.com/\" target=\"_blank\" title=\"___\" id=\"post_avatar_<%=id%>\" style=\"background-image:url('___')\" data-user-avatar-url=\"___\"",
            "            data-avatar-url=\"___\" data-blog-url=\"http://<%=blog_name%>.tumblr.com/\" data-use-channel-avatar=\"1\" data-use-sub-avatar=\"\" data-tumblelog-popover=\"{&quot;avatar_url&quot;:&quot;___&quot;,&quot;url&quot;:&quot;http:\/\/<%=blog_name%>.tumblr.com&quot;,&quot;name&quot;:&quot;<%=blog_name%>&quot;,&quot;title&quot;:&quot;___&quot;,&quot;following&quot;:true}\">",
            "                <img class=\"post_avatar_image\" src=\"___\" width=\"64\" height=\"64\">",
            "            </a>",
            "        </div>",
            "        <div class=\"post_wrapper\">",
            "            <div class=\"post_header\">",
            "                <div class=\"post_info\">",
            "                    <div class=\"post_info_fence has_follow_button\">",
            "                        <a href=\"http://<%=blog_name%>.tumblr.com/\" data-tumblelog-popover=\"{&quot;avatar_url&quot;:&quot;___&quot;,&quot;url&quot;:&quot;http:\/\/<%=blog_name%>}.tumblr.com&quot;,&quot;name&quot;:&quot;<%=blog_name%>&quot;,&quot;title&quot;:&quot;___&quot;,&quot;following&quot;:true}\"><%=blog_name%></a>",
            "                        <span class=\"reblog_source\">",
            "                        <span class=\"reblog_icon\" title=\"<%=blog_name%> reblogged <%=reblogged_from_name%>\">reblogged</span>",
            "                        <a title=\"<%=reblogged_from_name%>\" href=\"<%=reblogged_from_url%>\" data-tumblelog-popover=\"{&quot;avatar_url&quot;:&quot;___&quot;,&quot;url&quot;:&quot;http:\/\/<%=reblogged_from_name%>.tumblr.com&quot;,&quot;name&quot;:&quot;<%=reblogged_from_name%>&quot;,&quot;title&quot;:&quot;___&quot;,&quot;following&quot;:false,&quot;asks&quot;:true,&quot;anonymous_asks&quot;:1}\"><%=reblogged_from_name%></a>",
            "                        </span>",
            "                    </div>",
            "                    <a href=\"/follow/<%=reblogged_from_name%>\" class=\"reblog_follow_button\" data-tumblelog-name=\"<%=reblogged_from_name%>\" title=\"Follow <%=reblogged_from_name%>\"><i>Follow</i></a> ",
            "                </div>",
            "                <div class=\"post_source\">",
            "                    <a class=\"post_source_link\" target=\"_blank\" href=\"<%=source_url%>\" title=\"<%=source_title%>\"><%=source_title%></a>",
            "                    <span class=\"post_source_name_prefix\">Source:</span>",
            "                </div>",
            "            </div>"].join('\n');

    Vals.post_template_bodies = {
        text:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_container\">",
            "                        <div class=\"post_title\"><%=title%></div>",
            "                        <div class=\"post_body\"><%=body%></div>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        photo:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_media\">",
            "                        <img class=\"image_thumbnail\" alt=\"\" id=\"thumbnail_photo_<%=id%>\" data-full-size=\"<%=photo_full.url%>\" data-thumbnail=\"<%=photo_thumbnail.url%>\"",
            "                        data-width=\"<%=photo_full.width%>\" data-height=\"<%=photo_full.height%>\" data-thumbnail-width=\"<%=photo_thumbnail.width%>\" data-thumbnail-height=\"<%=photo_thumbnail.height%>\" style=\"cursor: pointer; background-color: transparent;\" width=\"<%=photo_thumbnail.width%>\" height=\"<%=photo_thumbnail.height%>\" src=\"<%=photo_thumbnail.url%>\"",
            "                        onload=\"if (this.src.indexOf('_100') != -1) { this.style.backgroundColor = 'transparent'; this.src='<%=photo_full.url%>'; }\">",
            "                        <div class=\"photo_info hidden\" style=\"height:27px;\">",
            "                            <a href=\"<%=source_url%></a>\"><%=source_url%></a> →",
            "                        </div>",
            "                    </div>",
            "                    <div class=\"post_body\">",
            "                        <%=caption%>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        quote:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_title small\">",
            "                      “<span class=\"quote\"><%=text%></span>”",
            "                    </div>",
            "                    <div class=\"post_body\">",
            "                        <table class=\"quote_source_table\">",
            "                            <tbody>",
            "                                <tr>",
            "                                    <td valign=\"top\" class=\"quote_source_mdash\">",
            "                                        —&nbsp;",
            "                                    </td>",
            "                                    <td valign=\"top\" class=\"quote_source\">",
            "                                      <%=source%>",
            "                                    </td>",
            "                                </tr>",
            "                            </tbody>",
            "                        </table>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        link: 
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_media\">",
            "                        <div class=\"link_button clickable\">",
            "                            <div class=\"link_text_container\">",
            "                                <div class=\"link_text_outer\">",
            "                                    <div class=\"link_text\">",
            "                                        <a href=\"<%=url%>\" target=\"_blank\" class=\"link_title\"><%=title%>&nbsp;→</a>",
            "                                        <a href=\"<%=url%>\" target=\"_blank\" class=\"link_source\">___domain___</a>",
            "                                    </div>",
            "                                </div>",
            "                            </div>",
            "                        </div>",
            "                    </div>",
            "                    <div class=\"post_body\">",
            "                      <%=description%>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        chat:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_title\">",
            "                        <%=title%></div>",
            "                    <div class=\"post_body\">",
            "                        <ul class=\"conversation_lines\">",
            "                          <% for (var i = 0; i < dialogue.length; i++) { var line = dialogue[i]; %>",
            "                          <li class=\"chat_line\">",
            "                            <strong><%=line.name%>:</strong>",
            "                            <%=line.phrase%>",
            "                          </li>",
            "                          <% } %>",
            "                        </ul>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        audio:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_media\">",
            "                      <%=embed%>",
            "                    </div>",
            "                    <div class=\"post_body\">",
            "                      <%=caption%>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n'),
        video:
            ["            <div class=\"post_content clearfix\">",
            "                <div class=\"post_content_inner clearfix\">",
            "                    <div class=\"post_media\">",
            "                        <div id=\"video_preview_<%=id%>\" class=\"retro_video_preview\" data-id=\"<%=id%>\" style=\"width: <%=thumbnail_width%>px; height: <%=thumbnail_height%>px;\">",
            "                            <div class=\"retro_thumbnail\" style=\"background-image: url('<%=thumbnail_url%>');\"></div>",
            "                            <div class=\"retro_fuzz\"></div>",
            "                            <div class=\"safety_glass\"></div>",
            "                            <div class=\"big_play_button\">",
            "                                <span>Play</span>",
            "                            </div>",
            "                        </div>",
            "                        <div id=\"watch_video_<%=id%>\" class=\"video\" data-id=\"<%=id%>\" style=\"display:none;\">",
            "                            <div id=\"video_embed_<%=id%>\" class=\"video_embed\"></div>",
            "                        </div>",
            "                        <input type=\"hidden\" id=\"video_code_<%=id%>\" value=\"<%=embed_code%>\">",
            "                    </div>",
            "                    <div class=\"post_body\">",
            "                        <%=caption%>",
            "                    </div>",
            "                </div>",
            "            </div>"].join('\n')
    };

    Vals.post_template_tail = 
            ["            <div class=\"post_footer clearfix\">",
            "                <div class=\"post_notes\">",
            "                    <div class=\"post_notes_inner\">",
            "                        <div class=\"post_notes_label note_count\">",
            "                            <span class=\"note_link_current\" title=\"0 notes\" data-less=\"\" data-more=\"1 note\"></span>",
            "                            <div class=\"notes_outer_container popover popover_gradient nipple_on_left\" style=\"display: none;\">",
            "                                <div class=\"notes_container popover_inner\">",
            "                                    <div class=\"popover_scroll\">",
            "                                        <ol class=\"notes\"></ol>",
            "                                        <div class=\"more_notes_link_container\">",
            "                                            <span class=\"notes_loading\">Loading...</span>",
            "                                            <a class=\"more_notes_link\" style=\"display:none;\" data-next=\"\" rel=\"nofollow\" href=\"#\">Show more notes</a>",
            "                                        </div>",
            "                                    </div>",
            "                                </div>",
            "                            </div>",
            "                        </div>",
            "                    </div>",
            "                </div>",
            "                <div class=\"post_controls\" role=\"toolbar\">",
            "                    <div class=\"post_controls_inner\">",
            "                      ",
            "                        <div class=\"post_control post_control_menu creator\" title=\"Post Options\">",
            "                            <div class=\"popover popover_menu popover_gradient nipple_on_bottom popover_post_control\">",
            "                                <ul class=\"popover_inner\">",
            "                                    <li class=\"popover_menu_item\">",
            "                                        <a class=\"post_control edit show_label\" title=\"Edit\" href=\"/edit/66047149103?redirect_to=%2Fblog%2F___\">Edit</a>",
            "                                    </li>",
            "                                    <li class=\"popover_menu_item\">",
            "                                        <div class=\"post_control delete show_label\" title=\"Delete\" data-confirm=\"Are you sure you want to delete this post?\">Delete</div>",
            "                                    </li>",
            "                                </ul>",
            "                            </div>",
            "                        </div>",
            "                        ",
            "                        <div class=\"post_control share share_social_button\" data-tumblelog-name=\"<%=blog_name%>\" data-post-id=\"<%=id%>\" id=\"share_social_button_<%=id%>\">",
            "                            <div class=\"popover popover_menu popover_gradient popover_share_social\">",
            "                                <div class=\"popover_inner\">",
            "                                    <ul class=\"share_options active\" data-post-url=\"<%=post_url%>\" data-post-tiny-url=\"<%=short_url%>\">",
            "                                        <li class=\"share_email popover_menu_item\">",
            "                                            <a href=\"#\">Email</a>",
            "                                        </li>",
            "                                        <li class=\"share_facebook popover_menu_item\" data-has-facebook=\"\">",
            "                                            <a href=\"#\">Facebook</a>",
            "                                        </li>",
            "                                        <li class=\"share_twitter popover_menu_item\" data-twitter-username=\"\">",
            "                                            <a href=\"#\">Twitter</a>",
            "                                        </li>",
            "                                        <li class=\"share_permalink popover_menu_item\">",
            "                                            <a href=\"<%=post_url%>\" target=\"_blank\" class=\"external\" title=\"Permalink\">Permalink</a>",
            "                                        </li>",
            "                                    </ul>",
            "                                    <form method=\"post\" class=\"share_form email_form\" id=\"share_email_<%=id%>\" novalidate=\"\">",
            "                                        <div class=\"form_wrapper\">",
            "                                            <div class=\"share_label\"></div>",
            "                                            <a href=\"#\" class=\"cancel service\" tabindex=\"-1\"></a>",
            "                                            <div class=\"input_group\">",
            "                                                <ul>",
            "                                                    <li>",
            "                                                        <input type=\"email\" class=\"email_address\" name=\"email_address\" maxlength=\"100\" placeholder=\"Email\" title=\"Email\">",
            "                                                        <input type=\"hidden\" name=\"post_id\" value=\"<%=id%>\">",
            "                                                        <input type=\"hidden\" name=\"tumblelog_name\" value=\"<%=blog_name%>\">",
            "                                                        <a href=\"#\" class=\"cancel\" tabindex=\"-1\"></a>",
            "                                                    </li>",
            "                                                    <li>",
            "                                                        <textarea name=\"message\" class=\"share_message\" maxlength=\"255\" placeholder=\"Message (Optional)\" title=\"Message (Optional)\"></textarea>",
            "                                                        <div class=\"character_count\">140</div>",
            "                                                    </li>",
            "                                                </ul>",
            "                                            </div>",
            "                                            <div class=\"reply_to\" title=\"Let them reply to ___\">",
            "                                                <input id=\"allow_reply_to_<%=id%>\" class=\"reply_to_input\" type=\"checkbox\" name=\"allow_reply_to\">",
            "                                                <label for=\"allow_reply_to_<%=id%>\" class=\"reply_to_label\">Let them reply to <span class=\"reply_to_email\">___</span>",
            "                                                </label>",
            "                                            </div>",
            "                                            <div class=\"error_status\"></div>",
            "                                            <button type=\"submit\" class=\"chrome blue email_submit\" data-label-sending=\"Sending...\" data-label=\"Send\" disabled=\"\">Send</button>",
            "                                        </div>",
            "                                    </form>",
            "                                    <div class=\"status\" data-sent=\"Sent!\" data-error=\"Error!\">",
            "                                        <span class=\"status_message\">Sent!</span>",
            "                                    </div>",
            "                                </div>",
            "                            </div>",
            "                        </div>",
            "                        <a class=\"post_control reblog\" title=\"Reblog\" href=\"/reblog/<%=id%>/<%=reblog_key%>?redirect_to=%2Fdashboard\"><span class=\"offscreen\">Reblog</span></a>",
            "                        <div class=\"post_control like\" title=\"Like\"></div>",
            "                    </div>",
            "                </div>",
            "            </div>",
            "            <a class=\"post_permalink\" id=\"permalink_<%=id%>\" href=\"<%=post_url%>\" target=\"_blank\" title=\"View post - 10:10am ___\">",
            "            </a>",
            "        </div>",
            "    </div>",
            "</li>"].join('\n');

    /**
     * オブジェクトをシリアライズします
     * http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
     * @param {Object} _obj 辞書型のオブジェクト.
     * @return {String} eval で復元できるシリアライズした文字列を返します.
     */
    function serialize(_obj)
    {
       // Let Gecko browsers do this the easy way
       if (Vals.browser != 'chrome' && typeof _obj.toSource !== 'undefined' && typeof _obj.callee === 'undefined')
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
             if (_obj instanceof RegExp) {
                /* RegExp return /regexp/ */
                return _obj.toString();
             }

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

    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    (function(){
      var cache = {};
     
      Etc.tmpl = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
         
          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
           
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
           
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .replace(/'/g, "\\’")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .replace(/\\’/g, "\\'")
              .split("\r").join("\\'")
          + "');}return p.join('');");
       
        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
      };
    })();

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
     * クライアント領域で Script を実行します
     * @param {String} code 実行したいコード
     */
    function execScript (code) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.innerHTML = code;
        script.addEventListener('onload', function(e) {
            (function letit(elm) {
                elm.parentNode.removeChild(elm);
            })(e.target);
        });
        document.body.appendChild(script);
    };

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
        return Array.apply(0, document.querySelectorAll(selector));
        /* return Array.prototype.slice.call(document.querySelectorAll(selector)); */
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
        /* TODO: GM_xmlhttprequest を使うようにする */

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

        if (options.method != 'POST') {
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
     * 引数から path を作成します
     * @param {String} tumblelog tumbelog名.
     * @param {String} type 取得対象のタイプ.
     * @param {String} offset post の取得位置オフセット.
     * @return {String} 上記をまとめた URL.
     */
    function buildNecromancyURL(tumblelog, tag, type, offset) {
        var url = 'http://www.tumblr.com/dashboard?tumblelog/';
        var params = [];

        if (tumblelog)           params.push(tumblelog);
        if (tag)                 params = url.concat(['tag', tag]);
        if (type)                params.push(type);
        if (offset != undefined) params.push(offset);

        return url + params.join('/');
    }

    /**
     * スクロール位置として次ページの読み込みを監視します
     * @param {Object} pe PeriodicalExecuter オブジェクト.
     */
    function necromancyPaginator(e, force) {
        if (!Vals.next_page) {
            window.removeEventListener(necromancyPaginator);
            return;
        }
        if (Vals.loading_next_page) {
            return;
        }

        var posts;
        if (force ||
            ((posts = $$('#posts > li')) &&
             (posts[posts.length - 1].offsetTop - (document.documentElement.offsetHeight + window.scrollY)) < Vals.LOAD_SCROLL_OFFSET)) {
            Vals.loading_next_page = true;

            var next_page_parsed = Vals.next_page.match(Vals.PATH_PARSER);
            var tumblelog = next_page_parsed[1];
            var tag = next_page_parsed[2] || '';
            var type = next_page_parsed[3] || '';
            var offset = next_page_parsed[4] || 0;

            if (tumblelog.search('\\.') == -1) {
                tumblelog += '.tumblr.com';
            }

            if (offset == 'random' && Vals.total_posts == null) {
                Vals.loading_next_page = false;
                return;
            }
            else if (offset == 'random') {
                offset = Math.floor(Math.random() * Vals.total_posts);
            }
            else {
                offset = parseInt(offset);
            }

            var querystring = buildQueryString({
                    limit: 10,
                    api_key: Vals.API_KEY,
                    reblog_info: 'true',
                    tag: decodeURI(tag),
                    offset: offset
            });

            var url = [
                'http://api.tumblr.com/v2/blog',
                tumblelog,
                'posts',
                 type + '?' + querystring].join('/');

            GM_xmlhttpRequest({
                url: url,
                method: 'GET',
                onload: function (xhr) {
                    var json = JSON.parse(xhr.responseText);
                    json.response.posts
                        .filter(function(e) {return e.type!=='answer';})
                        .map(function(e) {
                            console.log(e);
                            e.root_id = (e.reblogged_root_url || e.post_url).match(/(?:\/post\/|private_)(\d+)/)[1];
                            console.log(e.root_id);
                            e.reblogged_from_name = e.reblogged_from_name || "";
                            e.reblogged_from_url  = e.reblogged_from_url  || e.post_url;
                            e.source_url = e.source_url || "";
                            e.source_title = e.source_title || "";
                            if (e.type == 'photo') {
                                e.photo_full = e.photos[0].alt_sizes.filter(function(e){return e.width <= 500;})[0];
                                e.photo_thumbnail = e.photos[0].alt_sizes.filter(function(e){return e.width <= 150;})[0];
                                e.photo_thumbnail.height = parseInt(e.photo_thumbnail.height * (150 / e.photo_thumbnail.width));
                                e.photo_thumbnail.width = 150;
                            }
                            if (e.type == 'video') {
                                e.embed_code = e.player[2].embed_code.replace(/"/g, "'");
                            }
                            return e;
                        })
                        .map(function(e) {
                            console.log(e);
                            var template = Vals.post_template_head + Vals.post_template_bodies[e.type] + Vals.post_template_tail;
                            var html = Etc.tmpl(template, e);
                            var d = document.createElement('div');
                            d.innerHTML = html;
                            $$('#posts')[0].appendChild(d.children[0]);
                        });
                    Vals.loading_next_page = false;

                    var m = Vals.next_page.match(Vals.PATH_PARSER);
                    Vals.next_page = buildNecromancyURL(m[1], m[2] || '', m[3] || '', m[4] == 'random' ? m[4] : ((+m[4]) + 10));  // TODO +10 to limit
                    console.log(Vals.next_page);
                }
            });
        }
    }

    function getTotalPost() {
        var next_page_parsed = location.href.match(Vals.PATH_PARSER);
        var tumblelog = next_page_parsed[1];
        var tag = next_page_parsed[2] || '';
        var type = next_page_parsed[3] || '';
        var offset = parseInt(next_page_parsed[4] || 0);

        if (tumblelog.search('\\.') == -1) {
            tumblelog += '.tumblr.com';
        }

        var querystring = buildQueryString({
            limit: 10,
            api_key: Vals.API_KEY,
            reblog_info: 'true',
            tag: decodeURI(tag),
            offset: offset
        });

        var url = [
            'http://api.tumblr.com/v2/blog',
            tumblelog,
            'posts',
             type + '?' + querystring].join('/');

        GM_xmlhttpRequest({
            url: url,
            method: 'GET',
            synchronous: false,
            onload: function(xhr) {
                var json = JSON.parse(xhr.responseText);
                Vals.total_posts = json.response.total_posts;

                if (next_page_parsed[4] == 'random') {
                    necromancyPaginator(null, true);
                }
            },
        });
    }

    function startTumblelogCollection() {
        var first_observer = [];
        Vals.tumblelog_observers.push(first_observer);

        var m = location.href.match(Vals.PATH_PARSER);

        name   = m[1];
        tag    = m[2] || '';
        type   = m[3] || '';
        offset = m[4];
        random = m[4];

        var url = 'http://api.tumblr.com/v2/blog/' + (name) + '/posts';
        var parameters = 'api_key=lu2Ix2DNWK19smIYlTSLCFopt2YDGPMiESEzoN2yPhUSKbYlpV';
        new Ajax(url, {method: 'GET', parameters: parameters, onSuccess: function(xhr) {
            var json = JSON.parse(xhr.responseText);
            Array.prototype.push.apply(first_observer, json.response.posts);
        }});
    }

    function startLogObserver() {
        setInterval(function() {
            var elm_posts = document.querySelector('#posts');

            if (elm_posts === null) {
                return;
            }
            if (Vals.tumblelog_observers.length === 0) {
                return;
            }

            while (Vals.tumblelog_observers[0].length) {
                var json_post = Vals.tumblelog_observers[0].shift();
                var post = PostBuilder.similarPost(json_post);
                elm_posts.appendChild(post);
            }
        }, 1000);
    }

    /**
     * ユーザスクリプトが実行された際に呼び出される関数です
     */
    /* function initNecromancy */
    function necromancyInitialize() {

        execScript('AutoPaginator.stop()');
        window.addEventListener('scroll', necromancyPaginator);

        $$('#posts > li:not(.new_post_buttons_container)').map(function(elm) {
            elm.parentNode.removeChild(elm);
        });

        var m = location.href.match(Vals.PATH_PARSER);
        Vals.next_page = buildNecromancyURL(m[1], m[2] || '', m[3] || '', m[4] || 0);

        if (m[4] == 'random') {
            getTotalPost();
        }
        else {
            necromancyPaginator(null, true);
        }

        // var form_key = document.head.querySelector('#tumblr_form_key').getAttribute('content');
    }

    /**
     * Tumblelog に Necromancy 用のリンクを貼り付けます
     * TODO: 何の意味があってこれがあるのか分からないので調べる
     */
    function embedNecromancyLink() {
        var base_html = [
            '<div style="<%=div_style%>">',
            ' <a href="<%=url%>" style="<%=a_style%>">Necromancy</a>',
            '</div>',
        ].join('\n');

        var dict = {};
        dict['url'] = 'http://www.tumblr.com/dashboard?tumblelog/' + (location.hostname.replace(/\..+/,''));
        dict['div_style'] = [
            "margin: 3px;",
            "padding: 0 5px;",
            "position: absolute;",
            "top: 0;",
            "right: 330px;",
            "border: 1px solid rgba(0, 0, 0, 0.18);",
            "border-radius: 2px;",
            "background: rgba(0, 0, 0, 0.38);",
            "font-size: 12px;",
            "font-weight: 600;",
            "line-height: 18px;",
        ].join('');
        dict['a_style'] = [
                "color: white;",
                "text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.08);",
                "text-decoration: none;",
                'font: "Helvetica Neue","HelveticaNeue",Helvetica,Arial,sans-serif;',
                "font-size: 12px;",
                "font-weight: 600;",
                "line-height: 18px;",
        ].join('');

        var html = Etc.tmpl(base_html, dict);
        var elm = buildElementBySource(html);

        document.body.appendChild(elm);
    }

    /**
     * ユーザスクリプトが呼び出されたさいに呼び出されるメイン関数です
     */
    function main() {
        if (/^https?:\/\/www\.tumblr\.com\/dashboard\?tumblelog\/.+/.test(location)) {
            necromancyInitialize();
        }
        else if (/^https?:\/\/[a-z0-9\-_]+\.tumblr\.com\/?$/.test(location)) {
            embedNecromancyLink();
        }
    }

    if (window.document.body) {
        main();
    }
    else {
        window.document.addEventListener('DOMContentLoaded', main, false);
    }
})();
