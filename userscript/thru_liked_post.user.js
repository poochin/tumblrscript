// ==UserScript==
// @name        Thru liked post
// @namespace   https://github.com/poochin
// @version     1.0.0
// @description Dashboard で like 済みのポストを消します
// @include     http://www.tumblr.com/dashboard*
//
// @author      poochin
// @license     MIT
// @updated     2013-11-15
// @updateURL   https://github.com/poochin/tumblrscript/raw/master/userscript/
// ==/UserScript==

(function ThruLikedPost() {
    "use strict";

    function removeLikedPost(post) {
        if (post.querySelector('.liked')) {
            post.parentNode.removeChild(post);
            console.log('rmeoved', post);
        }
    }

    function addedPost (mutation) {
        var record = mutation[0];
        var posts;

        if (record.addedNodes.length) {
            posts = Array.apply(0, record.addedNodes);
            posts.map(removeLikedPost);
        }
    }

    function init() {
        Array.apply(0, document.querySelectorAll('#posts > .post_container'))
             .map(removeLikedPost);
    }

    function main() {
        var posts = document.querySelector('#posts');
        var observer = new MutationObserver(addedPost);
        var config = {
            childList: true
        };
        observer.observe(posts, config);

        init();
    }

    if (window.document.body) {
        main();
    }
    else {
        window.document.addEventListener('DOMContentLoaded', main, false);
    }
})();

