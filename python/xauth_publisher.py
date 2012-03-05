#!/usr/bin/env python
# -*- coding: utf-8 -*-
 
import urlparse
import oauth2 as oauth
import simplejson
import urllib
import netrc


def build_oauth_client():
    # とりあえず netrc のみに対応する
    nrc = netrc.netrc()
    xauth = nrc.authenticators('tumblr_client')
    user = nrc.authenticators('tumblr_xauth')
    token = oauth.Token(user[0], user[2])

    consumer = oauth.Consumer(xauth[0], xauth[2])
    client = oauth.Client(consumer, token)
    client.set_signature_method = oauth.SignatureMethod_HMAC_SHA1()
    return client

# TODO: posts データ →  post に変換する為の alias 関数か何かを作成する

def pickup_alias(src, aliases):
    results = {}
    for key, value in aliases.iteritems():
        if key in src:
            results[value] = src[key]
    return results


class Post(object):

    @staticmethod
    def parse(parent, json):
        post = {
            'text': Text,
            'photo': Photo,
            'quote': Quote,
            'link': Link,
            'answer': Chat,  #FIXME? checking name
            'audio': Audio,
            'video': Video
        }[json['type']](parent, json)

        # post.post['state']
        post.data['tags'] = json['tags']
        # post.data['tweet']
        # post.data['date']
        # post.data['slug']

        return post


    def __init__(self, parent):
        self.data = {}
        self.tumblelog = parent

    def publish(self):
        pass




class Text(Post):
    def __init__(self, tumblelog, json):
        super(Text, self).__init__(tumblelog)

        self.data['type'] = 'text'

        alias = {'title': 'title', 'body': 'body'}
        self.data.update(pickup_alias(json, alias))


class Photo(Post):
    def __init__(self, tumblelog, json):
        super(Photo, self).__init__(tumblelog)

        self.data['type'] = 'photo'
       
        # photo set にも対応させる
        alias = {'caption': 'caption', 'link_url': 'link'}
        self.data.update(pickup_alias(json, alias))


class Quote(Post):
    def __init__(self, tumblelog, json):
        super(Quote, self).__init__(tumblelog)

        self.data['type'] = 'quote'

        alias = {'text': 'quote', 'source': 'source'}
        self.data.update(pickup_alias(json, alias))


class Link(Post):
    def __init__(self, tumblelog, json):
        super(Link, self).__init__(tumblelog)

        self.data['type'] = 'link'

        alias = {'title': 'title', 'url': 'url', 'description': 'description'}
        self.data.update(pickup_alias(json, alias))


class Chat(Post):
    def __init__(self, tumblelog, json):
        super(Chat, self).__init__(tumblelog)

        self.data['type'] = 'chat'

        alias = {'title': 'title', 'conversation': 'body'}
        self.data.update(pickup_alias(json, alias))


class Audio(Post):
    def __init__(self, tumblelog, json):
        super(Audio, self).__init__(tumblelog)

        self.data['type'] = 'audio'

        alias = {'caption': 'caption'}
        self.data.update(pickup_alias(json, alias))
        # self.data['external_url']


class Video(Post):
    def __init__(self, tumblelog, json):
        super(Video, self).__init__(tumblelog)

        self.data['type'] = 'video'

        alias = {'caption': 'caption'}
        self.data.update(pickup_alias(json, alias))


class Tumblelog(object):

    def __init__(self, tumblelog):
        self.name = tumblelog
        self.posts = []

    def drafts(self):
        client = build_oauth_client()
        url = 'http://api.tumblr.com/v2/user/dashboard'
        # url = 'http://api.tumblr.com/v2/blog/%s/posts/draft' % (self.name)
        resp, content = client.request(url, method='GET')

        self.content = content
        self.json = simplejson.loads(content)

        self.msg = self.json['meta']['msg']
        self.status = self.json['meta']['status']

        self.posts = []
        for post in self.json['response']['posts']:
            self.posts.append(Post.parse(self, post))


t = Tumblelog('poochin.tumblr.com')
t.drafts()

for post in t.posts:
    print post.data


# params['x_auth_mode'] = 'client_auth'
# params['oauth_version'] = '1.0a'


