from threaded_messages.models import *
from app.models import UserProfile, Notification
import datetime
from django.utils.timezone import utc
from django.utils import timezone
from django.template.defaultfilters import pluralize
from templatetags.voting_tags_extended import get_percent


def inbox(request):
    if request.user.is_authenticated():
        u = request.user
        messages_read = Participant.objects.inbox_for(user=u, read=True)
        messages_unread = Participant.objects.inbox_for(user=u, read='False')
    else:
        messages_read = None
        messages_unread = None
    return {'inbox_read': messages_read,
            'inbox_unread': messages_unread
    }


def UserSettings(request):
    if request.user.is_authenticated():
        u = request.user
        settings = UserProfile.objects.get(user=u)
        if settings.last_active:
            if settings.last_active < timezone.now()-datetime.timedelta(minutes=20):
                settings.last_active = datetime.datetime.now()
                settings.save(update_fields=['last_active'])
        else:
            settings.last_active = datetime.datetime.now()
            settings.save(update_fields=['last_active'])
    else:
        settings = None
    return {'settings': settings}


def UserNotifications(request):
    notifications = []
    if request.user.is_authenticated():
        u = request.user.id
        notification_queue = Notification.manager.list(user_id=u)
        for o in list(notification_queue.list):
            if o.notification_type == 'comment':
                notifications.append(dict(title=str(o.count)+' new '+str('comment'+pluralize(o.count)), content=o.related_commenters+' commented on your post.', notification_ids=o.notification_ids.replace(',','-'), obj=o))
            elif o.notification_type =='vote':
                notifications.append(dict(title=str(o.count)+' new '+str('vote'+pluralize(o.count)), content=str(get_percent(o.post.id))+'% rating on your post', notification_ids=str(o.notification_ids.replace(',','-')), obj=o))
            elif o.notification_type =='status':
                notifications.append(dict(title='Post Update', content=o.content, notification_ids=str(o.id), obj=o))
            elif o.notification_type == 'follow_comment' or o.notification_type == 'follow_vote':
                notifications.append(dict(title='Post Update', content=str(str(o.comment_count)+' new comment'+pluralize(o.comment_count))+str(' and '+str(o.vote_count)+' new vote'+pluralize(o.vote_count) if o.vote_count > 0 else ''), notification_ids=str(o.notification_ids.replace(',','-')), obj=o))
        notification_count = notification_queue.unread
        notification_count_total = notification_queue.total
    else:
        notifications = None
        notification_count = None
        notification_count_total = None
    return {'notification_queue': notifications,
            'notification_count': notification_count,
            'notification_count_total': notification_count_total
    }