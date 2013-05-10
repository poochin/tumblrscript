// ==UserScript==
// @name        Necromancy Tumblelog
// @namespace   https://github.com/poochin
// @include     http://www.tumblr.com/blog/*
// @include     http://www.tumblr.com/list/*
// @include     http://*.tumblr.com/
// @version     1.1.9
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

    /**
     *  /blog/
     *    blog_name
     *      tag
     *        type
     *          random
     *          offset
     */
    Vals.PATH_PARSER = 
        /\/blog\/(?:([a-z0-9\-_.]+)\/?)(?:tag\/([^\/]+)\/?)?(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+|random)\/?)?$/;

    Vals.LIST_PARSER = /([a-z0-9\-]+(?:\.tumblr\.com)?)+/g;

    /**
     *
     */
    function ListObserver(names, options) {
        var self = this;

        this.namelist = names;
        this.cache = [];

        this.items = this.namelist.map(function(name) {
            return new TumblelogItem(self, name, options || {});
        });

        setInterval(Etc.preapply(this, this.timer), 1000);
    };

    ListObserver.prototype = {
        timer: function() {
            this.items.map(function(item) {
            });
        },
    };

    /**
     *
     */
    function TumblelogItem(list_observer, name, options) {
        this.name   = name;
        this.tag    = options.tag;
        this.type   = options.type;
        this.random = options.random;
        this.offset = options.offset;

        this.posts = [];

        this.list_observer = list_observer;
    };

    TumblelogItem.prototype = {
        getNextPosts: function() {
            if (this.posts <= 10) {
                var url = "";
            };
        },
    };

    /**
     *
     */
    function CacheObserver(list_observer) {
        this.list_observer = list_observer;
    };


    CacheObserver.prototype = {
    };



    Etc.preapply = function preapply(self, func, args) {
        return function() {
            func.apply(self, (args || []).concat(Array.prototype.slice.call(arguments)));
        };
    };

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

    /**
     * tParser
     * 構文:
     *   {{ A }}: 変数の代入
     *     ex: {{ A }}, {{A.B}}
     *   {{ iter A@B }}: 配列 A に B という名前を付けてループ
     *     ex: {{ iter A@B }} {{ B }} {{ /iter }}
     *         {{ iter A.a@B }} ... {{/iter}}
     * 
     * 自由度と制約:
     *   {{...}} で参照する際には、オブジェクトの階層を .(ドット) を用いて掘ることができます
     *   {{...}} の中括弧の直内は空白を自由に取って構いません
     *   {{ iter }} はネストできません
     *   {{ iter }} はインデックス番号を参照できません
     */
    Etc.tParser = function tParser(src) {
      var a = arguments;
      var self = this;
      var reg = /(?:{{\s*([A-Za-z0-9._]+)\s*}}|{{\s*iter\s+([A-Za-z0-9._]+)@([A-Za-z0-9_]+)\s*}}([\s\S]*){{\s*\/iter\s*}})/gm;
      var last_index = 0;
      var next_str = "";
      var nodes = [];
      
      /* ここでは置換ではなく字句解析目的で replace 関数を用いています */
      src.replace(reg,
        function(match_text, assign_key, iter_key, iter_as, iter_text, index, all_text){
          if (index !== 0) {
            nodes.push(self.tNode(all_text.slice(last_index, index), 'text'));
            last_index = index;
          }
          
          if (assign_key !== undefined) {
            nodes.push(self.tNode(assign_key, 'assign'));
            last_index += match_text.length;
          }
          else {
            nodes.push(self.tNode('', 'iter', {iter_key: iter_key, iter_as: iter_as, template: new Etc.tParser(iter_text)}));
            last_index += match_text.length;
          }
          next_str = all_text.slice(last_index);
        }
      );
      
      if (next_str.length) {
        nodes.push(self.tNode(next_str, 'text'));
      }
      
      this.nodes = nodes;
    }
     
    Etc.tParser.prototype = {
      digDict: function digDict(dict, keys) {
        if (keys.length === 1) {
          return dict[keys[0]];
        }
        
        return ((dict[keys[0]] !== undefined)
                ? (this.digDict(dict[keys[0]], keys.slice(1)))
                : (undefined));
      },
      textBuilder: function textBuilder(text, dict, iter_dict) {
        var self = this;
        var reg = /{{\s*([A-Za-z0-9._]+)\s*}}/gm;
        
        function replacer(a,b,c,d) {
          return self.digDict(iter_dict, b.split('.')) || self.digDict(dict, b.split('.')) || "";
        }
        
        return text.replace(reg, replacer);
      },
      tNode: function tNode(text, type, iter_options) {
        return {
          text: text,
          type: type, /* text, iter, assign */
          iter_options: iter_options, /* iter_key, iter_as */
        }
      },
      assign: function(dict) {
        var self = this;
        
        return this.nodes.map(
          function(tnode){
            var iter_array;
            var iter_results;
            
            switch(tnode.type) {
              case "iter":
                iter_array = self.digDict(dict, tnode.iter_options.iter_key.split('.'));
                
                iter_results = iter_array.map(function(src, index) {
                  /* FIXME: iter_dict と dict が重複した際に値が消えます */
                  var last_value, last_index, text;
                  
                  dict[tnode.iter_options.iter_as] = src;
                  dict['index'] = index.toString();
                  
                  text = tnode.iter_options.template.assign(dict);
                  
                  dict[tnode.iter_options.iter_as] = last_value;
                  dict['index'] = last_index;
                  
                  return text;
                });
                
                return iter_results.join('');
                
              case "assign":
              
                return self.digDict(dict, tnode.text.split('.')) || "";
            }
            
            return tnode.text;
          }
        ).join('');
      }
    };
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
            var note_count = parseInt(json.note_count);
            if (note_count == 0) {
                return buildElement('span'); 
            }

            var notes_onclick = 'void alert("このコマンドは実装できませんでした！！");';
            var notes = buildElement('a', {
                    href: '#',
                    id: 'show_notes_link_' + json.id,
                    class: 'reblog_count post_control',
                    onclick: notes_onclick});

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
         * @todo 
         */
        reblog_button: function(json) {
            var url_reblog = ['/reblog', json.id, json.reblog_key].join('/');
            var url_fast_reblog = ['/fast_reblog', json.id, json.reblog_key].join('/');
            return buildElement('a', {
                    href: url_reblog,
                    class: 'reblog_button post_control post_control_icon',
                    title: 'Reblog',
                    'data-reblog-key': json.reblog_key,
                    'data-reblog-id': json.id,
                    'data-user-form-key': LIKE_KEY});
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
                        class: 'like_button post_control post_control_icon like_root_' + root_id,
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
                    ' <span class="reblog_icon" title="' + (json.blog_name) + ' reblogged ' + (json.reblogged_from_name) + '">reblogged</span> ',
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
                var onload = '';
                if (midres.url.indexOf('_100') == -1) {
                    onload = [
                        "if (this.src.indexOf('_100') != -1) {",
                        "    this.style.backgroundColor = 'transparent';",
                        "    this.src = '" + (midres.url) + "';",
                        "}"].join('');
                }
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
             * @TODO thumbnail を埋め込むようにします
             * @TODO onmouseover, js: cycle_video_thumbnail() を作成する
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
                        thumbnails: ''}));

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
                                title: escape(json.track_name),
                                src: encodeURI(json.album_art)}));
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
                    class: 'post_footer_links'});
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
         * @TODO post_avatar.title
         * @TODO node follow 等の node を追加する
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
                        title: '???',
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
            else if ((now - post_date) < (7 * 24 * 60 * 60)) {
                var day_of_week = (new Date(json.timestamp)).getUTCDay();
                permalink_title += [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day_of_week];
            }
            else {
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

                if (now.getYear() != post_date.getYear()) {
                    permalink_title += ' ' + post_date.getFullYear();
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
         * API で取得したデータを元に擬似的に post 要素を作成します
         * @TODO liked かどうか判別できるように出来ないか
         * @param {Object} json API が返すうちポスト単位の JSON.
         * @return {Node} 作成した Node オブジェクト.
         */
        similarPost: function(json) {
            var post = buildElement('li', {id: 'post_' + json.id});
            post.className = [
                'post',
                json.type,
                (json.reblogged_from_name ? 'is_reblog' : ''),
                'not_mine'].join(' ');

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
    function buildNecromancyURL(tumblelog, tag, type, offset) {
        var url = ['http://www.tumblr.com/blog'];

        if (tumblelog)           url.push(tumblelog);
        if (tag)                 url = url.concat(['tag', tag]);
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

        var parsed_page_path = window.location.href.match(Vals.PATH_PARSER);
        if (window.new_json && parsed_page_path != 'random' && parsed_page_path[4] >= window.new_json.response.total_posts) {
            pe.stop();
            alert('Get last post!');
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

        var next_page_parsed = window.next_page.match(Vals.PATH_PARSER);
        var tumblelog = next_page_parsed[1];
        var tag = next_page_parsed[2] || '';
        var type = next_page_parsed[3] || '';
        var offset = next_page_parsed[4];

        var script = document.querySelector('body > script.necromancy_paginator');
        script.parentNode.removeChild(script);

        if (offset != 'random') {
            offset = parseInt(offset);
            var cur_path = buildNecromancyURL(tumblelog, tag, type, offset || 0);
            history.pushState('', '', cur_path);
            window.next_page = buildNecromancyURL(tumblelog, tag, type, (offset || 0) + 10);
        }
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
            (posts[posts.length - 1].positionedOffset().top - (document.viewport.getDimensions().height + document.viewport.getScrollOffsets().top)) < window.Vals.LOAD_SCROLL_OFFSET) {
            window.loading_next_page = true;

            var next_page_parsed = window.next_page.match(Vals.PATH_PARSER);
            var tumblelog = next_page_parsed[1];
            var tag = next_page_parsed[2] || '';
            var type = next_page_parsed[3] || '';
            var offset = next_page_parsed[4] || 0;

            if (tumblelog.search('\\.') == -1) {
                tumblelog += '.tumblr.com';
            }

            if (offset == 'random' && TOTAL_POST == null) {
                window.loading_next_page = false;
                return;
            }
            else if (offset == 'random') {
                offset = Math.floor(Math.random() * TOTAL_POST);
            }
            else {
                offset = parseInt(offset);
            }

            var querystring = buildQueryString({
                limit: 10,
                api_key: Vals.API_KEY,
                reblog_ifo: 'true',
                tag: decodeURI(tag),
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

    function getTotalPost() {
        var next_page_parsed = window.next_page.match(Vals.PATH_PARSER);
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
            offset: offset,
            jsonp: 'void function(json){window.TOTAL_POST = json.response.total_posts;}'});

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

    function rebuildDocumentPage() {
        /**
         * http://www.tumblr.com/dashboard から HTML を取得して差し替えます
         * そのままだと有効にならない CSS や JavaScript を埋め込み直して有効になるようにします
         */

        var tumblr_scripts  = [
            'http://assets.tumblr.com/languages/strings/en_US.js?838',
            'http://assets.tumblr.com/javascript/jquery_with_plugins.js?55d600b2029041781b32956f270dc4a7',
            'http://assets.tumblr.com/assets/scripts/dashboard.js?56ba83a724097cfa925f3947d923f6bf',

            'http://assets.tumblr.com/javascript/prototype_and_effects.js?6d9a669b8f64150cfcbe643e4596e1e9',
            'http://assets.tumblr.com/javascript/application.js',
            'http://assets.tumblr.com/javascript/tumblelog.js',
            'http://assets.tumblr.com/javascript/spin.js',
            'http://assets.tumblr.com/javascript/sortable.js',
            'http://assets.tumblr.com/javascript/jquery.pano.js',
            'http://assets.tumblr.com/javascript/jquery.application.js',
        ];

        new Ajax(
            '/dashboard',
            {
                method: 'GET',
                asynchronous: false,
                onSuccess: function(xhr) {
                    /* TODO: style タグの移植はまだ行なっていません */

                    var head = xhr.responseText.match(/<head>([\s\S]*)<\/head>/)[1];
                    var body = xhr.responseText.match(/<body[^>]+>([\s\S]*)<\/body>/)[1];

                    document.head.innerHTML = head;
                    document.body.innerHTML = body;

                    LIKE_KEY = document.querySelector('meta#tumblr_form_key').getAttribute('content');

                    $$('#posts > li:not(.new_post)').map(function(elm) {
                        elm.parentNode.removeChild(elm);
                    });

                    var scripts = tumblr_scripts.map(function(src) {
                        var script = document.createElement('script');

                        script.setAttribute('src', src);
                        script.setAttribute('type', 'text/javascript');

                        return script;
                    });

                    var run_script = [
                        'window.Tumblr.enable_dashboard_key_commands = true;',
                        'window.Tumblr.KeyCommands = new window.Tumblr.KeyCommandsConstructor();',
                        'window.next_page = location.pathname;',
                        'window.prev_json = window.new_json = null;',
                        'window.TOTAL_POST = null;',
                        'window.Vals = ' + (serialize(Vals)) + ';',
                        'window.PostBuilder = ' + (serialize(PostBuilder)) + ';',
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
                        '(', getTotalPost, ')();',
                        'new PeriodicalExecuter(necromancyPaginator, 0.2);',
                        'new PeriodicalExecuter(necromancyObserver, 0.02);',
                    ].join('\n');

                    var script = document.createElement('script');
                    script.innerHTML = run_script;
                    script.setAttribute('type', 'text/javascript');

                    scripts.push(script);

                    scripts.map(function(elm, index, array) {
                        elm.addEventListener('load', function() {
                            if(array[index+1]) {
                                document.body.appendChild(array[index+1]);
                            }
                        });
                    });

                    document.head.appendChild(scripts[0]);
                },
            }
        );
    }

    function startTumblelogCollection() {
        var first_observer = [];
        Vals.tumblelog_observers.push(first_observer);

            var m = location.href.match(
                /\/blog\/(?:([a-z0-9\-_.]+)\/?)(?:tag\/([^\/]+)\/?)?(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+|random)\/?)?$/);
            
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

        rebuildDocumentPage();
        setTimeout(startTumblelogCollection, 100);
        startLogObserver();

        return;

        /**
         * 巡回するべきタンブルログを収集する
         * タンブルログ名を取得したら巡回クラスのインスタンスに投げ巡回を開始させる
         * ページを定義し直します
         * 巡回から post を回収するクラスのインスタンスを生成して起動する
         */

        var tumblelog_names = [];

        /**
         * タンブルログ名を集めます
         */
        if (/^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location)) {
            var name, tag, type, offset, random;
            var m = location.href.match(
                /\/blog\/(?:([a-z0-9\-_.]+)\/?)(?:tag\/([^\/]+)\/?)?(?:(text|quote|link|answer|video|audio|chat|photo)\/?)?(?:(\d+|random)\/?)?$/);
            
            name   = m[1];
            tag    = m[2] || '';
            type   = m[3] || '';
            offset = m[4];
            random = m[4];

            /**
             * ここでタンブルログ巡回クラスのインスタンスを生成します
             */

             tumblelog_names.push(name);
        }
        else {
            var lists = location.pathname.match(Vals.LIST_PARSER).slice(1);
            new ObserverList(lists);
        }

        rebuildDocumentPage();

        var form_key = document.head.querySelector('#tumblr_form_key').getAttribute('content');

        /**
         * タンブルログ名から巡回クラスのインスタンスを生成します
         */
    }

    /**
     * Tumblelog に Necromancy 用のリンクを貼り付けます
     * TODO: 何の意味があってこれがあるのか分からないので調べる
     */
    function embedNecromancyLink() {
        var base_html = [
            '<div style="{{ div_style }}">',
            ' <a href="{{ url }}" style="{{ a_style }}">Necromancy</a>',
            '</div>',
        ].join('\n');

        var dict = {};
        dict['url'] = 'http://www.tumblr.com/blog/' + (location.hostname);
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

        var t = new Etc.tParser(base_html);
        var html = t.assign(dict);
        var elm = buildElementBySource(html);

        document.body.appendChild(elm);
    }

    /**
     * ユーザスクリプトが呼び出されたさいに呼び出されるメイン関数です
     */
    function main() {
        if (/^https?:\/\/www\.tumblr\.com\/blog\/follower/.test(location)) {
            return;
        }
        if (/www\.tumblr\.com/.test(location.host) &&
            document.querySelector('#left_column')) {
            return;
        }

        if (/^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location)) {
            necromancyInitialize();
        }
        else if (/^https?:\/\/www\.tumblr\.com\/list\/.*/.test(location)) {
            necromancyInitialize();
        }
        else if (/^https?:\/\/[a-z0-9\-_]+\.tumblr\.com\/?$/.test(location)) {
            embedNecromancyLink();
        }
    }

    /**
     * スクリプトの実行はこのページで良いのか返します
     * @return {Boolean} 実行してよいページの場合は true を返します.
     */
    function isExecPage() {
        if (Vals.browser == 'opera') {
            if (Vals.PATH_PARSER.test(location) &&
                (/^https?:\/\/www\.tumblr\.com\/blog\/.*/.test(location) /* for Opera */ &&
                 /<script type="text\/javascript" language="javascript">var status_code = '(403|404)'<\/script>/.test(
                    document.documentElement.innerHTML)) ||
                /^https?:\/\/[a-z0-9\-_]+\.tumblr\.com\/?$/.test(location)) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
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
})();
