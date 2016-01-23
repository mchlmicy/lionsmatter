import settings as sendgrid_settings
from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from .models import *
from .fields import CommaSeparatedUserField
from .utils import reply_to_thread, now
from .signals import message_composed


if sendgrid_settings.THREADED_MESSAGES_USE_SENDGRID:
    from sendgrid_parse_api.utils import create_reply_email


notification = None
if "notification" in settings.INSTALLED_APPS:
    from notification import models as notification


class ComposeForm(forms.Form):
    """
    A simple default form for private messages.
    """
    recipient = CommaSeparatedUserField(label=_(u"Recipient"))
    subject = forms.CharField(label=_(u"Subject"))
    body = forms.CharField(label=_(u"Body"),
        widget=forms.Textarea(attrs={'rows': '12', 'cols': '55'}))

    def __init__(self, *args, **kwargs):
        recipient_filter = kwargs.pop('recipient_filter', None)
        super(ComposeForm, self).__init__(*args, **kwargs)
        if recipient_filter is not None:
            self.fields['recipient']._recipient_filter = recipient_filter

    def save(self, sender, send=True):
        recipients = self.cleaned_data['recipient']
        subject = self.cleaned_data['subject']
        body = self.cleaned_data['body']

        new_message = Message.objects.create(body=body, sender=sender)

        thread = Thread.objects.create(subject=subject,
                                       latest_msg=new_message,
                                       creator=sender)
        thread.all_msgs.add(new_message)

        for recipient in recipients:
            Participant.objects.create(thread=thread, user=recipient)

        (sender_part, created) = Participant.objects.get_or_create(thread=thread, user=sender)
        sender_part.replied_at = sender_part.read_at = now()
        sender_part.save()

        thread.save()  # save this last, since this updates the search index

        message_composed.send(sender=Message,
                              message=new_message,
                              recipients=recipients)

        return (thread, new_message)


class ReplyForm(forms.Form):
    """
    A simple default form for private messages.
    """
    body = forms.CharField(label=_(u"Reply"),
        widget=forms.Textarea(attrs={'rows': '4', 'cols': '55'}))

    def save(self, sender, thread):
        body = self.cleaned_data['body']
        return reply_to_thread(thread, sender, body)