// ==UserScript==
// @name        Notification Full Image
// @match       http://www.tumblr.com/dashboard
// @match       http://www.tumblr.com/blog/*
// @version     1.0.0
// @description ユーザスクリプトの概要を記入してください
// 
// @author      poochin
// @license     MIT
// @updated     1970-01-01
// @updateURL   https://github.com/poochin/
// ==/UserScript==

(function Skelton() {

    var css = [
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


    function main() {
        var style, notifications;

        style = document.head.appendChild(document.createElement('style'));
        style.innerHTML = css;

        notifications = Array.prototype.slice.call(document.querySelectorAll('#posts > .notification'));
        notifications.map(appendFullImage);

        document.getElementById('posts').addEventListener('DOMNodeInserted', function(e) {
            var elm = e.target;
            if (/\bnotification\b/.test(elm.className)) {
                appendFullImage(elm);
            }
        });
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
