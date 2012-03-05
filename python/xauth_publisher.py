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
        super(Post, self).__init__(tumblelog)

        self.data['type'] = 'text'

        self.data['title'] = ''  #FIXME
        self.data['body'] = ''  #FIXME


class Photo(Post):
    def __init__(self, parent, json):
        super(Photo, self).__init__()

        self.data['type'] = 'photo'
        
        self.data['caption'] = json['caption']
        self.data['link'] = json['link_url']
        self.data['source']  #FIXME
        self.data['data']  #FIXME


class Quote(Post):
    def __init__(Quote, parent, json):
        super(Post, self).__init__()

        self.data['type'] = 'quote'

        self.data['quote']  #FIXME
        self.data['source']  #FIXME


class Link(Post):
    def __init__(self, parent, json):
        super(Link, self).__init__()

        self.data['type'] = 'link'

        self.data['title']  #FIXME
        self.data['url']  #FIXME
        self.data['description']  #FIXME


class Chat(Post):
    def __init__(self, parent, json):
        super(Chat, self).__init__()

        self.data['type'] = 'chat'

        self.data['title']  #FIXME
        self.data['conversation']  #FIXME


class Audio(Post):
    def __init__(self, parent, json):
        super(Audio, self).__init__()

        self.data['type'] = 'audio'

        self.data['caption']  #FIXME
        self.data['external_url']  #FIXME
        self.data['data']  #FIXME

class Video(Post):
    def __init__(self, parent, json):
        super(Video, self).__init__()

        self.data['type'] = 'video'

        self.data['caption']  #FIXME
        self.data['embed']  #FIXME
        self.data['data']  #FIXME


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

print len(t.posts)

# params['x_auth_mode'] = 'client_auth'
# params['oauth_version'] = '1.0a'


