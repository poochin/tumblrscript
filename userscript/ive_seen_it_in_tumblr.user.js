// ==UserScript==
// @name        I've seen it in tumblr.
// @namespace   https://github.com/poochin
// @match       http://www.tumblr.com/dashboard*
// @match       http://www.tumblr.com/tagged*
// @match       http://www.tumblr.com/show*
// @version     1.0.2
// @description 一度見たポストを表示しないようにさせます
// 
// @author      poochin
// @license     MIT
// @updated     2012-06-17
// @updateURL   https://github.com/poochin/tumblrscript/blob/master/userscript/ive_seen_it_in_tumblr.user.js
// ==/UserScript==

/**
 * @fixme 自分のポストに対しては動きません
 */
(function IveSeenItInTumblr() {
    var reblog_keys,
        enable;

    boot();
    
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

    function postAppended(post) {
        var reblog_button, reblog_key;
    
        reblog_button = post.querySelector('a.reblog_button');
        if (reblog_button) {
            reblog_key = reblog_button.getAttribute('data-reblog-key');
            if (reblog_keys[reblog_key]) {
                console.log('Delete:', post.getAttribute('id'));
                post.parentNode.removeChild(post);
            }
            else {
                reblog_keys[reblog_key] = 1;
            }
        }
    }
    
    function appendToPosts(e) {
        if (enable == false) {
            /* pass */
        }
        else if (e.target.nodeType == document.ELEMENT_NODE) {
            postAppended(e.target);
        }
    }
    
    function init() {
        enable = localStorage.getItem('itintumblr_enable');
        enable = (enable == null ? false : enable == 'true');
    
        reblog_keys = null;
        if (enable) {
            reblog_keys = localStorage.getItem('itintumblr_reblog_keys');
            reblog_keys = (reblog_keys == null ? {} : JSON.parse(reblog_keys));
        }
    }
    
    function command_field() {
        var base, right_column, itintumblr, toggle_messages, fieldset_html, fieldset;
    
        toggle_messages = ['toEnable', 'toDisable'];

        fieldset_html = [
            '<legend>I\'ve seen it in tumblr.</legend>',
            '<button class="enable_toggle_button"></button>',
            '<button class="check">Check</button>',
            '<br />',
            '<button class="save_button">Save</button>',
            '<button class="clear_button">Clear</button>'].join('');

        fieldset = buildElement('fieldset',
            {id: 'itintumblr',
             style: 'border-radius: 6px;'},
            fieldset_html);
 
        right_column = document.querySelector('#right_column');
        right_column.appendChild(fieldset);
    
        fieldset.querySelector('.enable_toggle_button').innerText = toggle_messages[enable + 0];
        fieldset.querySelector('.enable_toggle_button').addEventListener('click', function(e) {
            enable = !enable;
            localStorage.setItem('itintumblr_enable', enable);
            e.target.innerText = toggle_messages[enable + 0];
            if (enable && reblog_keys === null) {
                reblog_keys = localStorage.getItem('itintumblr_reblog_keys');
                reblog_keys = (reblog_keys == null ? {} : JSON.parse(reblog_keys));
            }
        }, false);
    
        fieldset.querySelector('.check').addEventListener('click', function(e) {
            var k, cnt;
    
            cnt = 0;
            for (k in reblog_keys) {
                cnt++;
            }
    
            alert('閲覧済みのポスト数: ' + cnt + '個');
        }, false);
    
        fieldset.querySelector('.save_button').addEventListener('click', function(e) {
            if (reblog_keys !== null) {
                localStorage.setItem('itintumblr_reblog_keys', JSON.stringify(reblog_keys));
            }
        }, false);
    
        fieldset.querySelector('.clear_button').addEventListener('click', function(e) {
            if (confirm('記憶済みの post をクリアしますか？')) {
                localStorage.removeItem('itintumblr_reblog_keys');
                reblog_keys = {};
            }
        }, false);
    }
    
    function main() {
        init();
        command_field();
    
        document.querySelector('#posts').addEventListener('DOMNodeInserted', appendToPosts, true);
        if (enable) {
            Array.prototype.slice.call(document.querySelectorAll('#posts > li.post:not(.new_post)')).map(postAppended);
        }
    }
    
    function isExecPage() {
        return /^https?:\/\/www\.tumblr\.com\/dashboard(\/.*)?/.test(location) ||
               /^https?:\/\/www\.tumblr\.com\/tagged(\/.*)?/.test(location) ||
               /^https?:\/\/www\.tumblr\.com\/show(\/.*)?/.test(location);
    }
    
    function boot() {
        if (isExecPage() === false) {
            return;
        }

        if (window.document.body) {
            main();
        }
        else {
            window.document.addEventListener('DOMContentLoaded', main, false);
        }
    }
})();
