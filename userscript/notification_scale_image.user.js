// ==UserScript==
// @name        Notification Full Image
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/blog/*
// @version     1.0.6
// @description ユーザスクリプトの概要を記入してください
// 
// @author      poochin
// @license     MIT
// @updated     1970-01-01
// @updateURL   https://github.com/poochin/
// ==/UserScript==

(function Skelton() {

    var css = [
        "#posts > .notification {",
        "    overflow: visible;",
        "}",
        "#posts > .notification img.full {",
        "    display: none !important;",
        "    position: absolute !important;",
        "    top: 0 !important;",
        "    left: 32px !important;",
        "    width: 150px !important;",
        "    height: auto !important;",
        "}",
        "#posts > .notification:hover img.full {",
        "    display: inline !important;",
        "}",
        ".ui_notes > div.ui_note {",
        "    overflow: visible;",
        "}",
        ".ui_notes > div.ui_note img.full {",
        "    display: none !important;",
        "    position: absolute !important;",
        "    top: 0 !important;",
        "    left: 32px !important;",
        "    width: 150px !important;",
        "    height: auto !important;",
        "}",
        ".ui_notes > div.ui_note:hover img.full {",
        "    display: inline !important;",
        "}",
    ].join('\n');

    boot();

    function appendFullImage(elm) {
        var preview_frame, sq_img, large_img, img;

        if (preview_frame = elm.querySelector('.preview_frame')) {
            /* Dashboard */
            sq_img = preview_frame.querySelector('img').src;
        }
        else if (preview_frame = elm.querySelector('.ui_post_badge.photo')) {
            /* Activity ページ */
            sq_img = preview_frame.style.backgroundImage.match(/\((.*)\)/)[1];
            sq_img = sq_img.replace(/\"/g, '');
        }
        else {
            return elm;
        }
        large_img = sq_img.replace('_75sq.', '_100.');

        img = document.createElement('img');
        img.src = large_img;
        img.className = 'full';
        preview_frame.appendChild(img);

        return elm;
    }

    function addAltText(elm) {
        var quote_elm, quote;

        if (quote_elm = elm.querySelector('.em')) {
            /* Dashboard */
            quote = quote_elm.textContent;
        }
        else if (quote_elm = elm.querySelector('.summary')) {
            /* Activity */
            quote = quote_elm.textContent;
        }
        else {
            return elm;
        }
        quote = quote.replace(/(\s|\r|\n)+/g, ' ');

        elm.setAttribute('title', quote);

        return elm;
    }

    function notificationObserver(mutation) {
        Array.apply(0, mutation[0].addedNodes)
             .filter(function(elm) {return /\b(notification|ui_note)\b/.test(elm.className);})
             .map(appendFullImage)
             .map(addAltText);
    }

    function main() {
        var notes;
        var observer, target, config;

        document.head.appendChild(document.createElement('style'))
                     .innerHTML = css;

        if (document.querySelector('#posts')) {
            /* Dashboard */
            target = document.querySelector('#posts');
            notes = Array.apply(0, target.querySelectorAll('.notification'));
        }
        else {
            /* Activity */
            target = document.querySelector('.ui_notes');
            notes = Array.apply(0, document.querySelectorAll('div.ui_note'));
        }

        observer = new MutationObserver(notificationObserver);
        config = {childList: true};
        observer.observe(target, config);

        notes.map(appendFullImage)
             .map(addAltText);
    }

    function isExecPage() {
        return /^https?:\/\/[^\/]+\/.*/.test(location);
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
