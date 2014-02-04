// ==Taberareloo==
// {
//   "name"        : "Tornadoo Default Shortcut keys"
// , "namespace"   : "https://github.com/poochin/tumblrscript"
// , "description" : "Extend Dashboard Shortcut keys"
// , "include"     : ["content"]
// , "match"       : ["http://www.tumblr.com/dashboard*"]
// , "version"     : "1.0.0"
// , "downloadURL" : "https://raw.github.com/poochin/tumblrscript/taberarelooscript6_tb_next.tbrl.js"
// }
// ==/Taberareloo==

(function(){
    var Tornadoo = window.Tornadoo;
    var Core = Tornadoo.Core,
        Common = Tornadoo.Common;

    Common.shortcuts.push(
        new Core.CustomShortcut({
                key_bind: ['j'],
                // func: CustomFuncs.default, 
                func: function(post, e, options) {
                    console.log(true);
                },   
                title: 'Next',
                desc: {
                    ja: '次ポストへ移動',
                    en: 'Go to the next post'
                },   
                group: 1,
                grouporder: 1,
        })
    );
})();

