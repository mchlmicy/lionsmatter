from django.template import Library
from voting.models import Vote
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal, ROUND_DOWN

register = Library()

@register.simple_tag
def get_upvotes(post):
    try:
        post_content_type = ContentType.objects.get(model='post')
        return len(Vote.objects.filter(vote='1',object_id=post, content_type_id=post_content_type.id))
    except Vote.DoesNotExist:
        return '0'

@register.simple_tag
def get_downvotes(post):
    try:
        post_content_type = ContentType.objects.get(model='post')
        return len(Vote.objects.filter(vote='-1',object_id=post, content_type_id=post_content_type.id))
    except Vote.DoesNotExist:
        return '0'

@register.simple_tag
def get_comment_upvotes(comment):
    try:
        comment_content_type = ContentType.objects.get(model='comment')
        return len(Vote.objects.filter(vote='1', object_id=comment, content_type_id=comment_content_type.id))
    except Vote.DoesNotExist:
        return '0'

@register.simple_tag
def get_comment_downvotes(comment):
    try:
        comment_content_type = ContentType.objects.get(model='comment')
        return len(Vote.objects.filter(vote='-1',object_id=comment, content_type_id=comment_content_type.id))
    except Vote.DoesNotExist:
        return '0'

@register.filter
def get_comment_total_votes(comment):
    try:
        comment_content_type = ContentType.objects.get(model='comment')
        return len(Vote.objects.filter(object_id=comment, content_type_id=comment_content_type.id))
    except Vote.DoesNotExist:
        return '0'

@register.simple_tag
def get_percent(post):
    try:
        post_content_type = ContentType.objects.get(model='post')
        up = len(Vote.objects.filter(vote='1',object_id=post, content_type_id=post_content_type.id))
        total = len(Vote.objects.filter(object_id=post, content_type_id=post_content_type.id))
        if total > 0:
            percent = int(round((up/float(total))*100))
            return percent
        else:
            return "0"
    except Vote.DoesNotExist:
        return '0'