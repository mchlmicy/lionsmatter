from django import template
from app.models import Notification

register = template.Library()

@register.filter
def notification_objs(notification_obj_ids):
    #Prodive a single ID or list o ID's separated by hyphens (-)
    notification_ids = notification_obj_ids.split("-")
    try:
        notifications = Notification.objects.filter(id__in=notification_ids)
        return list(notifications)
    except notifications.DoesNotExist:
        return notification_obj_ids
