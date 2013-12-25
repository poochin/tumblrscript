// ==Taberareloo==
// {
//   "name"        : "Tornadoo"
// , "namespace"   : "https://github.com/poochin/tumblrscript"
// , "description" : "Extend Dashboard Shortcut keys"
// , "include"     : ["content"]
// , "match"       : ["http://www.tumblr.com/dashboard*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/poochin/tumblrscript/taberarelooscript/patch.tb_tornadoo.tbrl.js"
// }
// ==/Taberareloo==


(function _Tornadoo() {
    'use strict';

    var Tornadoo = {};
    var Core,
        Common,
        Vals;

    window.Tornadoo = Tornadoo;

    Tornadoo.Core = Core = {};
    Tornadoo.Common = Common = {};

    Core.Vals = Vals = {};
    Common.shortcuts = [];

    Vals.margin_top = 7;

    Core.key_cache = {
        cache: [],
        cache_length: 3,
        expire_time: 2000,
        last_time: 0,
        clear: function() {
            this.cache.length = 0;
        },
        add: function(e) {
            var ch,
                key_with = '',
                key;

            if (112 <= e.keyCode && e.keyCode <= 123) {
                return; /* function key */
            }
            else if (!(65 <= e.keyCode && e.keyCode <= 90) &&
                     !(48 <= e.keyCode && e.keyCode <= 57)) {
                return; /* Not Alphabet and Number */
            }
            else if ((['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) >= 0) ||
                (/\bmceContentBody\b/.test(e.target.className))) {
                return; /* 入力エリア、またはリッチテキスト内では無効にします */
            }

            ch = String.fromCharCode(e.keyCode);
            if (e.shiftKey) {
                key_with += 's';
            }
            if (e.ctrlKey) {
                key_with += 'c';
            }
            if (e.altKey) {
                key_with += 'a';
            }

            key = "";
            if (key_with.length) {
                key = key_with + '-';
            }
            key += ch.toLowerCase();

            if (this.last_time + this.expire_time < new Date()) {
                this.cache.length = 0;
            }
            this.last_time = (new Date() * 1);

            this.cache.push(key);
            this.cache = this.cache.slice(-this.cache_length);
        },
    };

    Core.CustomShortcut = function CustomShortcut(options) {
        this.key_bind = options.key_bind;
        this.func = options.func;

        this.url  = options.url || null;
        this.expr = ((options.expr && typeof options.expr === 'function')
                      ? options.expr
                      : function() {return true;});

        this.has_selector = options.has_selector || null;
        this.options =  options.options || {};

        // this.desc = options.desc | '';
        // this.usehelp = ((options.usehelp === undefined) ? true : options.usehelp);
        // this.title = options.title || options.func.name || options.func;
        // this.group = options.group || 0;
        // this.grouporder = options.grouporder;
    };

    Core.CustomShortcut.prototype = {
        urlTest: function urlTest() {
            return true; /* TODO */
        },
        keyTest: function keyTest() {
            var cache = Core.key_cache.cache;
            var self = this;

            if (cache.length === 0 || cache.length < this.key_bind.length) {
                return false;
            }

            var r = cache.slice(-(this.key_bind.length)).every(function(v, i) {
                var key = self.key_bind[i];
                var key_reg;

                if (key instanceof RegExp) {
                    key_reg = key;
                }
                else {
                    key_reg = new RegExp('^' + key + '$');
                }

                return key_reg.test(v);
            });

            return r;
        },
        hasSelectorTest: function(post) {
            if (this.has_selector === null) {
                return true;
            }
            if (post && post.querySelector(this.has_selector)) {
                return true;
            }
            return false;
        },
        exprTest: function(post) {
            if (typeof this.expr === 'function') {
                return this.expr(post);
            }
            return true;
        },
    };

    Core.viewportRect = function viewportRect() {
        return {
            left: document.documentElement.scrollLeft || document.body.scrollLeft,
            top: document.documentElement.scrollTop || document.body.scrollTop,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight};
    };


    Core.sortShortcuts = function sortShortcuts(a, b) {
            function nullToLength(str) {
                if (str === null) {
                    return 0;
                }
                return str.length;
            }
            return ((b.key_bind.length - a.key_bind.length) ||
                    (nullToLength(b.has_selector) - nullToLength(a.has_selector)) ||
                    ((b.url || '').length - ((a.url || '').length)));
    };

    Core.key_event = function key_event(e) {
        var post,
            vr = Core.viewportRect();

        Core.key_cache.add(e);

        post = Array.apply(document.querySelectorAll('#posts > .post_container:not(.new_post) > .post')).filter(function(elm) {
            return Math.abs(vr.top - (elm.offsetTop - Vals.margin_top)) < 5;
        })[0];

        if (!post) {
            console.info('Post not found');
        }

        Common.shortcuts
            .slice()
            .sort(Core.sortShortcuts)
            .some(function(shortcut) {
                if (!shortcut.urlTest()) {
                    return false;
                }
                else if (!shortcut.hasSelectorTest(post)) {
                    return false;
                }
                else if (!shortcut.exprTest(post)) {
                    return false;
                }
                else if (!shortcut.keyTest(Core.key_cache)) {
                    return false;
                }

                shortcut.func(post, e, shortcut.options);
                Core.key_cache.clear();

                return true;
            });
    };

    document.addEventListener('keydown', Tornadoo.Core.key_event);

})();
