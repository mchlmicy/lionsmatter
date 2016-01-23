from django import template
from django.utils.http import urlquote

register = template.Library()

@register.simple_tag
def shareFacebook(post_id, post):
    summary_facebook = str('http://www.facebook.com/sharer.php?s=100&p[title]=LionsMatter&p[url]=http%3A%2F%2Flionsmatter.com/post/')+str(post_id)+str('&p[summary]=')+urlquote(post)
    return "<a href='" + summary_facebook + "' target='_blank'><div class='shortcut'>" \
                                            "<span class='icon facebook'></span>Share</div></a>"

@register.simple_tag
def shareTwitter(post_id, category):
    summary_twitter = str('https://twitter.com/intent/tweet?url=http%3A//lionsmatter.com/post/')+str(post_id)+str('&hashtags=TCNJ,')+urlquote(category)
    return "<a href='" + summary_twitter + "' target='_blank'><div class='shortcut'><span class='icon twitter'>" \
                "</span>Tweet</div></a>"

@register.simple_tag
def shareFacebookM(post_id, post):
    summary_facebookM = str('http://www.facebook.com/sharer.php?s=100&p[title]=LionsMatter&p[url]=http%3A%2F%2Flionsmatter.com/post/')+str(post_id)+str('&p[summary]=')+urlquote(post)
    return summary_facebookM

@register.simple_tag
def shareTwitterM(post_id, category):
    summary_twitterM = str('https://twitter.com/intent/tweet?url=http%3A//lionsmatter.com/post/')+str(post_id)+str('&hashtags=TCNJ,')+urlquote(category)
    return summary_twitterM