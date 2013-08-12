// ==UserScript==
// @name        Notification Full Image
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/blog/*
// @version     1.0.1
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
        "    width: auto !important;",
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
        "    width: auto !important;",
        "    height: auto !important;",
        "}",
        ".ui_notes > div.ui_note:hover img.full {",
        "    display: inline !important;",
        "}",
    ].join('\n');

    boot();

    function appendFullImage(elm) {
        var preview_frame, sq_img, full_img;

        preview_frame = elm.querySelector('.preview_frame');
        if (preview_frame) {

            sq_img = preview_frame.querySelector('img');
            if (sq_img) {
                full_img = preview_frame.appendChild(document.createElement('img'));
                full_img.setAttribute('src', sq_img.getAttribute('src').replace('_75sq.', '_250.'));
                full_img.className = 'full';
            }
        }
    }

    function appendFullImage_Activity(elm) {
        var preview_frame, sq_img, full_img;

        preview_frame = elm.querySelector('.ui_post_badge.photo');
        if (preview_frame) {
            sq_img = preview_frame.style.backgroundImage.match(/\((.*)\)/)[1];
            if (sq_img) {
                full_img = preview_frame.appendChild(document.createElement('img'));
                full_img.setAttribute('src', sq_img.replace('_75sq.', '_250.'));
                full_img.className = 'full';
            }
        }
    }

    function addAltText(elm) {
        var quote;
        quote = elm.querySelector('em').textContent;
        quote = quote.replace(/(\s|\r|\n)+/g, ' ');
        elm.setAttribute('title', quote);
    }

    function addAltText_Activity(elm) {
        var quote = elm.querySelector('.summary').textContent;
        quote = quote.replace(/(\s|\r|\n)+/g, ' ');
        elm.setAttribute('title', quote);
    }

    function main() {
        var style, notifications;
        var base_elm;

        style = document.head.appendChild(document.createElement('style'));
        style.innerHTML = css;

        base_elm = document.getElementById('posts');
        if (base_elm) {
            notifications = Array.prototype.slice.call(document.querySelectorAll('#posts > .notification'));
            notifications.map(appendFullImage);
            notifications.map(addAltText);
            base_elm.addEventListener('DOMNodeInserted', function(e) {
                var elm = e.target;
                if (/\bnotification\b/.test(elm.className)) {
                    appendFullImage(elm);
                    addAltText(elm);
                }
            });
        }
        else {
            notifications = Array.prototype.slice.call(document.querySelectorAll('.ui_notes > div.ui_note'));
            notifications.map(appendFullImage_Activity);
            notifications.map(addAltText_Activity);
            document.querySelector('.ui_notes').addEventListener('DOMNodeInserted', function(e) {
                var elm = e.target;
                if (/\bui_note\b/.test(elm.className)) {
                    appendFullImage_Activity(elm);
                    addAltText_Activity(elm);
                }
            });
        }
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
