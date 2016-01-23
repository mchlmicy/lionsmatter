from django.template import Library
from django.utils.safestring import mark_safe
from app.models import Notification, Post
from django.contrib.auth.models import User
import re
from urlparse import urlparse
from django.conf import settings as lionsmatter_proj_settings

register = Library()

@register.filter
def dynamic_content(value, post_id=None):
    if lionsmatter_proj_settings.IS_PRODUCTION is False:
        #keep commented value = re.sub(r'#(?P<tag>\w+)', '<a href="/hashtag/\g<tag>/" rel="external">#\g<tag></a>', value) # hashtags
        url_pattern = re.findall(r'((?:http[s]?://)?[\w\.]+\.(?:com|gl|net|org|edu|ly|gov)[^,\s]*)', value)
        for u in url_pattern:
            value = re.sub(re.escape(u),'</a><a href="' + str(urlparse(u, 'http').geturl()) + '">\g<0></a><a class="lead" href="/post/'+str(post_id)+'">', value)
            user_pattern = re.findall(r'@(?P<username>\w+)', value)
            for u in user_pattern:
                try:
                    user = User.objects.get(username=u)
                except User.DoesNotExist:
                    continue
            else:
                regex = r'@' + re.escape(u)
                value = re.sub(regex, '@<a href="/'+u+'">'+u+'</a>', value)
    return mark_safe(value)

@register.assignment_tag(takes_context=True)
def following_unotified(context, **kwargs):
    if str(kwargs['comment_or_vote']) == str('comment'):
        return len(Notification.objects.filter(post_id=context['post'].id, user_id=context['request'].user.id, notification_type='follow_comment', notified=0))
    elif str(kwargs['comment_or_vote']) == str('vote'):
        return len(Notification.objects.filter(post_id=context['post'].id, user_id=context['request'].user.id, notification_type='follow_vote', notified=0))
    else:
        return 0

@register.assignment_tag
def get_post_obj(post_id):
    try:
        post = Post.objects.get(pk=post_id)
        return(post)
    except Post.DoesNotExist:
        pass