#!/usr/bin/env python
# -*- coding: UTF-8 -*-
'''
name: tumbled2pub
desc: Tumblelog の Drafts を公開するスクリプト
license: MIT
version: ('x')?
'''

# -n オプションを使用するには ~/.netrc にログイン情報を追加してください
# (Example)
# machine  tumblr
# login    login@email.address
# account  staff.tumblr.com
# password login_password

import sys
import netrc
import urllib
import getpass
import xml.sax.saxutils
import time
from optparse import OptionParser
from xml.dom import minidom

usage = "usage: %prog [options]"



def unescape(str):
    return xml.sax.saxutils.unescape(str, {'&quot;': '"'})


def innerText(elm):
    e = elm.firstChild
    return e.toxml().encode('UTF-8') if e else ""


def gettext_by_tagname(elm, tagname):
    elms = elm.getElementsByTagName(tagname)
    return innerText(elms[0]) if len(elms) else ''


class Tumblepost(object):
    # {type:
    #     {tag name: post option name}}
    aliases = {
        'regular': {
            'regular-title': 'title',
            'regular-body': 'body'},
        'photo': {
            'photo-caption': 'caption',
            'photo-link-url': 'click-through-url'},
        'quote': {
            'quote-text': 'quote',
            'quote-source': 'source'},
        'link': {
            'link-text': 'name',
            'link-description': 'description',
            'link-url': 'url'},
        'conversation': {
            'conversation-title': 'title',
            'conversation-text': 'conversation'},
        'video': {
            'video-caption': 'caption'},
        'audio': {
            'audio-caption': 'caption'}}

    def __init__(self, elm):
        self.elm = elm
        self.post = {}
        self.post['type'] = elm.getAttribute('type')
        self.post['post-id'] = elm.getAttribute('id')
        self.post['reblog-key'] = elm.getAttribute('reblog-key')

        for (tagname, optname) in self.aliases[self.post['type']].items():
            self.post[optname] = unescape(gettext_by_tagname(elm, tagname))

    def reblog(self):
        pass  # 今はいらない

    def publish(self, login_info, delay):
        post = self.post.copy()
        post.update(login_info)
        post['state'] = 'published'

        response = None
        for _ in xrange(3):
            handle = urllib.urlopen('http://www.tumblr.com/api/write',
                                    data=urllib.urlencode(post))
            response = handle.read()
            if response.isdigit():
                break
            time.sleep(delay)
        else:
            return None
        return response


class Tumblelog(object):
    def __init__(self, responce):
        self.tumblr = minidom.parseString(responce)
        self.posts = []

        posts = self.tumblr.getElementsByTagName('post')
        for elm in posts:
            self.posts.append(Tumblepost(elm))


def getdrafts(login_info, tumblelog):
    postdata = login_info.copy()
    postdata.update({'state': 'draft'})
    h = urllib.urlopen("http://%s/api/read" % tumblelog,
                       data=urllib.urlencode(postdata))
    return h.read()


def main(email, password, tumblelog, options):
    login_info = {'email': email, 'password': password}
    drafts = getdrafts(login_info, tumblelog)

    if (options.output):
        print drafts
        return

    tumblelog = Tumblelog(drafts)

    posts = tumblelog.posts if not options.reverse else tumblelog.posts[::-1]
    lenposts = len(posts)

    nexttime = time.time()
    curnum = 1
    count = options.count
    totalcount = options.totalcount
    second = options.second

    print "Get %d drafts." % (lenposts)
    while posts:
        if nexttime <= time.time():
            seq, posts = posts[0:count], posts[count:]
            for post in seq:
                post_id = post.publish(login_info, delay=options.wait)
                if post_id:
                    print "\r[%d/%d] published: %s" % (curnum, lenposts, post_id)
                else:
                    print "\r[%d/%d] published: Missing"
                curnum += 1
                if totalcount and curnum > totalcount:
                    break
            nexttime = nexttime + second
        if totalcount and curnum > totalcount:
            break
        print "\rWait: %3f sec" % (nexttime - time.time()),
        time.sleep(0.0001)
    print "\r%d drafts was published." % (curnum - 1)


def netrc_tumblr():
    try:
        nrc = netrc.netrc()
    except IOError:
        print ">>> Not found ~/.netrc <<<"
        return None
    return nrc.authenticators('tumblr')


if __name__ == '__main__':
    parser = OptionParser()

    parser.add_option("-s", "--second", dest="second", type="int", default=60,
                      help=u"一巡の間隔[秒]")
    parser.add_option("-n", "--netrc", dest="netrc",
                      action="store_true", help=u"ログイン情報の入力に ~/.netrc を利用します。")
    parser.add_option("-c", "--count", dest="count", type="int", default=2,
                      help=u"一巡ごとに公開するpost数")
    parser.add_option("-a", "--totalcount", dest="totalcount", type="int",
                      help=u"公開する全post数")
    parser.add_option("-e", "--email", dest="email",
                      help=u"ログインに使うemail")
    parser.add_option("-p", "--password", dest="password",
                      help=u"ログインに使うパスワード")
    parser.add_option("-t", "--tumblelog", dest="tumblelog",
                      help=u"公開する下書きのある Tumblelog")
    parser.add_option("-w", "--wait", dest="wait", type="float", default="1",
                      help=u"Reblog 失敗時に遅延する秒")
    parser.add_option("-r", "--reverse", dest="reverse", action="store_true", default=False,
                      help=u"Drafts を逆順（古い順）に published にします。")
    parser.add_option("-O", "--output", dest="output", action="store_true", default=False,
                      help=u"取得 Drafts をそのまま出力して終了します。")
    # TODO: -d diff オプション。 reblog-key を用いて重複を省く

    (options, args) = parser.parse_args()
    email, password, tumblelog = None, None, None

    if options.netrc:
        info = netrc_tumblr()
        if info:
            email, tumblelog, password = info

    email = options.email or email or raw_input('Input login email: ')
    password = options.password or password or raw_input('Input login password: ')
    tumblelog = options.tumblelog or tumblelog or \
                             getpass.getpass('Input target tumblelog <ex. staff.tumblr.com>: ')

    main(email, password, tumblelog, options)
