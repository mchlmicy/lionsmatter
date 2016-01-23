from django import template
from django.contrib.auth.models import User
from django.contrib.comments.models import Comment
from django.core.urlresolvers import reverse

register = template.Library()

@register.simple_tag
def get_comment_link(post_id, user_id):
    try:
        comment = Comment.objects.get(user_id=user_id, object_pk=post_id, content_type='8')
        return reverse('comment', args=[post_id, comment.id])
    except Comment.DoesNotExist:
        return reverse('post', args=[post_id])
