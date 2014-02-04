// ==UserScript==
// @name        Notes Filter
// @namespace   https://github.com/poochin
// @include     http://www.tumblr.com/dashboard*
// @include     http://www.tumblr.com/tagged*
// @include     http://www.tumblr.com/search/*
// @version     1.0.12
// @description Dashboard フィルター(Notes Filter)
//
// @author      poochin
// @license     MIT
// @updated     2012-12-09
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/notes_filter.user.js
// ==/UserScript==

(function NotesFilter() {
    var filter_value, filter_type, now_filtering, embed_css;

    document.head.appendChild(document.createElement('style')).textContent = [
        "#posts .post_container.notesfilter_flagged > .post {",
        "   opacity: 0.5;",
        // "   max-height: 1.5em !important;",
        "   overflow: hidden;",
        "}",
        "#posts .post_container.notesfilter_flagged:hover > .post {",
        "   opacity: 1;",
        "   overflow: visible;",
        "}",
        "#posts .post_container.notesfilter_flagged > .post .post_content {",
        "   display: none !important;",
        "}",
        "#posts .post_container.notesfilter_flagged:hover > .post .post_content {",
        "   display: block !important;",
        "}",
    ].join('\n');

    boot();

    function buildElement(tag_name, propaties, innerHTML) {
        var elm = document.createElement(tag_name);
    
        for (var key in (propaties || {})) {
            elm.setAttribute(key, propaties[key]);
        }
    
        elm.innerHTML = innerHTML || '';
        return elm;
    }

    function embedCustomOperator () {
        var fieldset = buildElement('fieldset', {}, 
            ["<legend>Notes Filter</legend>",
             "<input type=\"text\" size=\"3\" class=\"notesfilter_value\" value=\"500\" />",
             "<label><input type=\"radio\" name=\"notesfilter_type\" class=\"notesfilter_over\" checked>超</label>",
             "<label><input type=\"radio\" name=\"notesfilter_type\" class=\"notesfilter_less\">以下</label><br />",
             "<button class=\"notesfilter_enable\">発動する</button>",
             "<button class=\"notesfilter_disable\" style=\"display: none;\">やめる</button>"].join(''));

        var text_value, radio_over, radio_less;
        var button_enable, button_disable;

        text_value = fieldset.querySelector('.notesfilter_value');
        
        radio_over = fieldset.querySelector('.notesfilter_over');
        radio_less = fieldset.querySelector('.notesfilter_less');

        radio_over.addEventListener('change', function(e) {
            filter_type = 'over';
        });
        radio_less.addEventListener('change', function(e) {
            filter_type = 'less';
        });

        button_enable = fieldset.querySelector('.notesfilter_enable');
        button_disable = fieldset.querySelector('.notesfilter_disable');

        button_enable.addEventListener('click', function(e) {
            now_filtering = true;
            filter_value = parseInt(text_value.value);
            button_enable.style.display = 'none';
            button_disable.style.display = 'inline';

            launchFilter();
        });
        button_disable.addEventListener('click', function(e) {
            now_filtering = false;
            button_enable.style.display = 'inline';
            button_disable.style.display = 'none';

            quitFilter();
        });

        fieldset.style.clear = 'both';

        document.body.querySelector('#right_column, .right_controls').appendChild(fieldset);
    }

    function filter (elm) {
        var elm_notes, notes_count;

        console.log(elm);

        elm_notes = elm.querySelector('.note_link_current');
        if (elm_notes == null) {
            return false;
        }

        notes_count = parseInt(elm_notes.innerHTML.replace(/(,|\.|\s|\u2002)/g, ''));
        if (filter_type == 'over') {
            return (notes_count > filter_value);
        }
        else if (filter_type == 'less') {
            return (notes_count <= filter_value);
        }

        return false;
    }

    function launchFilter() {
        Array.prototype.slice.call(document.querySelectorAll('#posts > li.post_container:not(.new_post_buttons_container), #search_posts > .post_container')).map(function(elm) {
            if (filter(elm) == false) {
                elm.classList.add('notesfilter_flagged');
            }
        });
    }

    function quitFilter() {
        Array.prototype.slice.call(document.querySelectorAll('#posts > li.post_container:not(.new_post_buttons_container), #search_posts > .post_container')).map(function(elm) {
            elm.classList.remove('notesfilter_flagged');
        });
    }

    function filterEvent(e) {
        var elm;

        if (now_filtering == false) {
            return;
        }

        elm = e.target;
        if (elm && elm.nodeType == 1 && filter(elm) == false) {
            elm.classList.add('notesfilter_flagged');
        }
    }

    function postDoubleClick(e) {
        var elm, style;

        elm = e.target;
        postfound: {
            while (elm.tagName && elm.id != 'posts') {
                if (elm.tagName.toUpperCase() == 'LI' &&
                    /\bpost_container\b/.test(elm.className)) {
                    break postfound;
                }
                elm = elm.parentNode;
            }
            return;
        }
        window.scrollTo(0, elm.offsetTop - 7);

        getSelection().removeAllRanges(); // ダブルクリックによって文字/画像の選択が発生するのを抑止しています
    }

    function main() {
        filter_value = 500;
        filter_type = 'over';
        now_filtering = false;

        document.querySelector('#posts, #search_posts').addEventListener('DOMNodeInserted', filterEvent);
        document.querySelector('#posts, #search_posts').addEventListener('dblclick', postDoubleClick, true);

        embedCustomOperator();
    }

    function isExecPage() {
        /* for Opera function */
        return (/^https?:\/\/www\.tumblr\.com\/dashboard\/?/.test(location) ||
                /^https?:\/\/www\.tumblr\.com\/tagged\/?/.test(location) ||
                /^https?:\/\/www\.tumblr\.com\/search\/?/.test(location));
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
