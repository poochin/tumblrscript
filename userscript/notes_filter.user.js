// ==UserScript==
// @name        Notes Filter
// @namespace   https://github.com/poochin
// @include     http://www.tumblr.com/dashboard*
// @include     http://www.tumblr.com/tagged*
// @version     1.0.8
// @description Dashboard フィルター(Notes Filter)
//
// @author      poochin
// @license     MIT
// @updated     2012-12-09
// @updateURL   https://github.com/poochin/tumblrscript/
// ==/UserScript==

(function NotesFilter() {
    var filter_value, filter_type, now_filtering, embed_css;

    document.head.appendChild(document.createElement('style')).textContent = [
        ".notesfilter_flagged {",
        "   opacity: 0.5;",
        "   max-height: 1em !important;",
        "}",
        ".notesfilter_flagged > .post_content,",
        ".notesfilter_flagged > .footer_links {",
        "   display: none !important;",
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

            trimFilter();
        });

        document.body.querySelector('#right_column').appendChild(fieldset);
    }

    function filter (elm) {
        var elm_notes, notes_count;

        elm_notes = elm.querySelectorAll('.post_control.reblog_count span')[1];
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
        Array.prototype.slice.call(document.querySelectorAll('#posts > li.post:not(.new_post)')).map(function(elm) {
            if (filter(elm) == false) {
                elm.classList.add('notesfilter_flagged');
            }
        });
    }

    function trimFilter() {
        Array.prototype.slice.call(document.querySelectorAll('#posts > li.post:not(.new_post)')).map(function(elm) {
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
                    /\bpost\b/.test(elm.className)) {
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

        document.querySelector('#posts').addEventListener('DOMNodeInserted', filterEvent);
        document.querySelector('#posts').addEventListener('dblclick', postDoubleClick, true);
        embedCustomOperator();
    }

    function isExecPage() {
        return (/^https?:\/\/www\.tumblr\.com\/dashboard\/?/.test(location) ||
                /^https?:\/\/www\.tumblr\.com\/tagged\/?/.test(location));

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
