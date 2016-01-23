from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.utils import timezone
from voting.models import Vote
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, SmartResize, ResizeToCover
from django.contrib.comments.models import Comment
from generic_aggregation import generic_annotate
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from django.core.urlresolvers import reverse
from collections import namedtuple
from itertools import chain
from django.conf import settings
from django.contrib.comments.signals import comment_was_posted
from django.contrib.contenttypes.models import ContentType

PRIORITY_CATEGORIES = ((2, 'Academics'),
                          (3, 'Administration'),
                          (4, 'Dining Services'),
                          (5, 'Facilities'),
                          (6, 'ResLife'),
                          (7, 'Student Services'))

STATUS_CODES = ((1, 'Received'),
                          (2, 'Sorted'),
                          (3, 'Forwarded'),
                          (4, 'Response'),
                          (5, 'Mediation'),
                          (6, 'Flagged'),
                          (7, 'Gold'),
                          (9, 'Resolved'))


class Category(models.Model):
    title = models.CharField(max_length=30)
    icon = models.CharField(max_length=30)
    shortname = models.CharField(max_length=30)
    is_active = models.BooleanField(default=1)
    is_special = models.BooleanField(default=0)
    special = models.ForeignKey('SpecialCategory', blank=True, null=True, on_delete=models.SET_NULL)

    def __unicode__(self):
        if self.is_special:
            return u'%s (Topic)' % self.title
        else:
            return u'%s' % self.title

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"


class SpecialCategory(models.Model):
    description = models.CharField(max_length=500)
    group = models.CharField(max_length=150)
    has_open_forum_1 = models.DateTimeField(auto_now=False, auto_now_add=False, null=True, blank=True)
    has_open_forum_2 = models.DateTimeField(auto_now=False, auto_now_add=False, null=True, blank=True)
    has_open_forum_3 = models.DateTimeField(auto_now=False, auto_now_add=False, null=True, blank=True)
    attachment = models.FileField(upload_to='documents/', blank=True, null=True)
    allows_media = models.BooleanField(default=0)
    created = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return u'%s (Topic)' % self.group

    class Meta:
        verbose_name = "Special Category"
        verbose_name_plural = "Special Categories"


class Post(models.Model):
    post = models.CharField(max_length=5000)
    category = models.ForeignKey('Category')
    status = models.ForeignKey('StatusUpdates', related_name='post_status')
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User)
    user_displayname = models.CharField(max_length=200)
    vine = models.URLField()
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    image_thumbnail = ImageSpecField(source='image', processors=[ResizeToFill(100, 100)], format='JPEG', options={'quality': 80})
    image_large = ImageSpecField(source='image', processors=[ResizeToCover(640, 480)], format='JPEG', options={'quality': 80})
    followers = models.ManyToManyField(User, related_name='followers')

    def _get_popularity(self):
        "Returns the popularity score"
        votes = Vote.objects.get_score(self)['score']
        comments = Comment.objects.filter(object_pk=self.id).count()
        return votes+(comments*3)
    popularity = property(_get_popularity)

    def _get_gold_status(self):
        "Determines whether the post is gold"
        try:
            checkGold = StatusUpdates.objects.get(post_id=self.id, status_code_id='7')
            if checkGold:
                return True
        except StatusUpdates.DoesNotExist:
            return False
    is_gold = property(_get_gold_status)

    def _get_most_recent_status_date(self):
        "Returns the date (MM-DD_YY) of the most recent StatusUpdate for the post"
        try:
            status = self.status
            return status.date
        except StatusUpdates.DoesNotExist:
            return False
    most_recent_status_date = property(_get_most_recent_status_date)

    def __unicode__(self):
        return u'%s' % self.post


class Department(models.Model):
    name = models.CharField(max_length=150, blank=True)
    shortname = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=12)
    email = models.EmailField(blank=True)
    parent = models.ForeignKey(Category)

    def __unicode__(self):
        return u'%s' % self.name


class Status(models.Model):
    code = models.CharField(max_length=30,choices=STATUS_CODES)

    def __unicode__(self):
        return u'%s' % self.code


class StatusUpdates(models.Model):
    post = models.ForeignKey(Post)
    status_code = models.ForeignKey('Status')
    status_recipient_dept = models.ForeignKey(Department, blank=True, null=True)
    status_recipient_email = models.EmailField()
    status_recipient_response = models.CharField(max_length=1000)
    status_recipient_response_obj = models.ForeignKey(Comment, blank=True, null=True)
    status_recipient_user = models.ForeignKey(User, blank=True, null=True)
    flag = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(default=timezone.now)

    def _get_date_only(self):
        "Provides the date (without time).  Used for agenda."

        obj = self.timestamp.date()
        return obj
    date = property(_get_date_only)

    def __unicode__(self):
        return u'%s' % self.status_code.code


class NotificationManager(models.Manager):
    def list(self, user_id):
        def use_raw_sql(self, user_id, notification_type, notified):
            return self.raw("SELECT app_notification.*, count(app_notification.post_id) as count, GROUP_CONCAT(app_notification.id) as notification_ids FROM `app_notification` LEFT JOIN app_post ON app_post.id = app_notification.post_id WHERE app_notification.notification_type = %s AND app_notification.notified = %s AND app_notification.user_id = %s GROUP BY app_notification.post_id, app_notification.notification_type ORDER BY -app_notification.timestamp", [notification_type, notified, user_id])
        if settings.IS_PRODUCTION: # MYSQL-specific call
            def use_raw_sql_follow(self, user_id, notification_type, notification_type_2, notified):
                return self.raw("SELECT app_notification.*, SUM(if(app_notification.notification_type='follow_comment', 1, 0)) as comment_count, SUM(if(app_notification.notification_type='follow_vote', 1, 0)) as vote_count, GROUP_CONCAT(app_notification.id) as notification_ids FROM `app_notification` LEFT JOIN app_post ON app_post.id = app_notification.post_id WHERE (app_notification.notification_type = %s OR app_notification.notification_type = %s) AND app_notification.notified = %s AND app_notification.user_id = %s GROUP BY app_notification.post_id HAVING comment_count > 0 ORDER BY -app_notification.timestamp", [notification_type, notification_type_2, notified, user_id])
        else: # SQLite-specific call
            def use_raw_sql_follow(self, user_id, notification_type, notification_type_2, notified):
                return self.raw("SELECT app_notification.*, SUM(CASE WHEN app_notification.notification_type='follow_comment' THEN 1 ELSE 0 END) as comment_count, SUM(CASE WHEN app_notification.notification_type='follow_vote' THEN 1 ELSE 0 END) as vote_count, GROUP_CONCAT(app_notification.id) as notification_ids FROM `app_notification` LEFT JOIN app_post ON app_post.id = app_notification.post_id WHERE (app_notification.notification_type = %s OR app_notification.notification_type = %s) AND app_notification.notified = %s AND app_notification.user_id = %s GROUP BY app_notification.post_id HAVING comment_count > 0 ORDER BY -app_notification.timestamp", [notification_type, notification_type_2, notified, user_id])
        NotificationList = namedtuple('NotificationList', ['list', 'unread', 'total'], verbose=True)
        votes_unread = use_raw_sql(self, user_id, 'vote', '0')
        comments_unread = use_raw_sql(self, user_id, 'comment', '0')
        status_unread = self.filter(notification_type='status', notified='0', user_id=user_id)
        follow_unread = use_raw_sql_follow(self, user_id, 'follow_comment', 'follow_vote', '0')
        notification_list_unread = sorted(chain(votes_unread,comments_unread,status_unread, follow_unread),key=lambda instance: instance.timestamp)
        votes_read = use_raw_sql(self, user_id, 'vote', '1')
        comments_read = use_raw_sql(self, user_id, 'comment', '1')
        status_read = self.filter(notification_type='status', notified='1', user_id=user_id)
        notification_list_read = sorted(chain(votes_read,comments_read,status_read),key=lambda instance: instance.timestamp)
        notification_list = list(chain(notification_list_unread, notification_list_read))
        return NotificationList(list=notification_list, unread=len(notification_list_unread), total=len(notification_list))


class Notification(models.Model):
    actor = models.CharField(max_length=200, default='null')
    notification_type = models.CharField(max_length=20)
    post = models.ForeignKey(Post)
    content = models.CharField(max_length=200)
    notified = models.BooleanField(default=False)
    user = models.ForeignKey(User)
    timestamp = models.DateTimeField(default=timezone.now)

    def _get_related_commenters(self):
        "Provides a formated list of users who commented on the post related to the notification."
        obj = Notification.objects.get(pk=self.id)
        obj = list(Notification.objects.filter(post=obj.post, user=self.user, notification_type='comment', notified=self.notified).values_list('actor', flat=True).distinct())
        if len(obj) > 1:
            obj = ', '.join(obj[:-1]) + ' and ' + obj[-1]
        elif len(obj) == 1:
            obj = ''.join(obj[:1])
        return obj
    related_commenters = property(_get_related_commenters)

    objects = models.Manager() # The default manager.
    manager = NotificationManager()

    def __unicode__(self):
        if self.notification_type == 'vote':
            return u'%s on post %s' % (self.notification_type, self.post.id)
        elif self.notification_type == 'comment':
            return u'%s on post %s' % (self.notification_type, self.post.id)
        elif self.notification_type == 'status':
            return u'%s on post %s' % (self.notification_type, self.post.id)


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile')
    full_name = models.CharField(max_length=30, blank=True)
    display_name = models.CharField(max_length=30, blank=True)
    class_yr = models.SmallIntegerField(max_length=4, blank=True, null=True)
    major = models.CharField(max_length=30, blank=True)
    receive_notifications = models.SmallIntegerField(max_length=1, default=1)
    notification_email = models.EmailField(blank=True)
    last_active = models.DateTimeField(default=timezone.now)
    is_college_staff = models.NullBooleanField(default=0)
    staff_position = models.CharField(max_length=250, blank=True)
    department = models.ForeignKey(Department, blank=True, null=True)
    bio = models.CharField(max_length=700, blank=True)
    last_closed_site_messages = models.DateTimeField(null=True, blank=True)
    agreed_to_terms = models.BooleanField(default=False)

    def get_absolute_url(self):
        return "/%s/" % self.username


class SiteBug(models.Model):
    title = models.CharField(max_length=300, default='null')
    description = models.CharField(max_length=2000)
    page = models.CharField(max_length=200)
    login_status = models.CharField(max_length=200)
    device = models.CharField(max_length=200)
    screenshot = models.ImageField(upload_to='images/', blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return u'%s' % self.title

    class Meta:
        verbose_name = "Site Bug"
        verbose_name_plural = "Site Bugs"


class SiteMessage(models.Model):
    title = models.CharField(max_length=300)
    content = models.CharField(max_length=2000)
    timestamp = models.DateTimeField(default=timezone.now)
    only_public = models.BooleanField()
    only_users = models.BooleanField()
    priority = models.BooleanField()


    def __unicode__(self):
        return u'%s' % self.title

    class Meta:
        verbose_name = "Site Message"
        verbose_name_plural = "Site Messages"


class GlobalSettings(models.Model):
    name = models.CharField(max_length=300, blank=True)
    slug = models.CharField(max_length=300,  blank=True)
    value = models.CharField(max_length=2000)

    def __unicode__(self):
        return u'%s' % self.value

    class Meta:
        verbose_name = "Global Setting"
        verbose_name_plural = "Global Settings"


class Timeline(models.Model):
    type = models.CharField(max_length=35, blank=True)
    title = models.CharField(max_length=50,  blank=True)
    description = models.CharField(max_length=1000, blank=True)
    happens_when = models.CharField(max_length=1000, blank=True)
    submitted_by = models.ForeignKey(User)
    timestamp = models.DateTimeField(default=timezone.now)
    is_completed = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.type1


# Signals

def create_user_profile(sender, instance, created, **kwargs):
    if created:
       profile, created = UserProfile.objects.get_or_create(user_id=instance.id,display_name=instance.username,
                                                            notification_email=instance.username+'@tcnj.edu')

post_save.connect(create_user_profile, sender=User)


def vote_signal(sender, instance, created, **kwargs):
    if created and instance.content_type_id == 8:
        goldThreshold = GlobalSettings.objects.get(slug='gold_post_threshold').value
        getPost = Post.objects.get(id=instance.object_id)
        getUser = User.objects.get(id=getPost.user_id)
        getRequestUser = User.objects.get(username=instance.user)
        # send notification to post creator
        notification = Notification(actor=getRequestUser.id, notification_type='vote', content=instance.vote, post=getPost, user=getUser)
        notification.save()
        # send notification to followers
        for o in getPost.followers.all():
            followNotification = Notification(actor=instance.user_id, notification_type='follow_vote', content=instance.vote, post=getPost, user=o)
            followNotification.save()
        # handle gold posts
        if goldThreshold.isnumeric() and Vote.objects.get_score(getPost)['score'] >= int(goldThreshold) and getPost.status.status_code_id <= 2:
            postUserProfile = UserProfile.objects.get(user=getPost.user)
            new_gold_update = StatusUpdates.objects.create(post_id=getPost.id, status_code_id='7')
            getPost.status_id = new_gold_update.pk
            getPost.save(update_fields=['status_id'])
            gold_notification = Notification(actor="LionsMatter", content="Your post has been nominated by the LionsMatter community to be forwarded to TCNJ's administration.", notification_type="status", post=getPost, user=getUser)
            gold_notification.save()
            postLink = reverse('post', args=[getPost.pk])
            # Send an email to the user
            if postUserProfile.receive_notifications == 1:
                html_content = render_to_string('email/post_went_gold.html', {'user':getPost.user,'postLink':postLink})
                text_content = strip_tags(html_content) # this strips the html, so people will have the text as well.

                # create the email, and attach the HTML version as well.
                msg = EmailMultiAlternatives('Status Update on Your Post', text_content, 'Lionsmatter@lionsmatter.com', [postUserProfile.notification_email])
                msg.attach_alternative(html_content, "text/html")
                msg.send()

post_save.connect(vote_signal, sender=Vote, dispatch_uid='lionsmatter_vote_signal')


def comment_signal(sender, comment, request, **kwargs):
    post_content_type =  ContentType.objects.get(model="post")
    if comment and comment.content_type_id == post_content_type.id:
        getPost = Post.objects.get(id=comment.object_pk)
        getUser = User.objects.get(id=getPost.user_id)
        # send notification to post creator
        notification = Notification(actor=comment.name, notification_type='comment', post=getPost, content=comment.comment, user=getUser)
        notification.save()
        # send notification to followers
        for o in getPost.followers.all():
            followNotification = Notification(actor=comment.name, notification_type='follow_comment', post=getPost, content=comment.comment, user=o)
            followNotification.save()
        Profile = UserProfile.objects.get(user=getUser)
        postLink = reverse('post', args=[getPost.pk])
        if Profile.receive_notifications == 1 and getUser != request.user:
            html_content = render_to_string('email/new_comment.html', {'comment':comment,'user':getUser,'userProfile':Profile
                ,'postLink':postLink}) # ...
            text_content = strip_tags(html_content) # this strips the html, so people will have the text as well.

            # create the email, and attach the HTML version as well.
            msg = EmailMultiAlternatives('New Comment on Your Post', text_content, 'Lionsmatter@lionsmatter.com', [Profile.notification_email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        if getPost.status.status_code.id in (4, 5) and (comment.user == getPost.status.status_recipient_user or comment.user.email == getPost.status.status_recipient_email):
            new_response_update = StatusUpdates.objects.create(post=getPost, status_code_id='5'
                        , status_recipient_dept=getPost.status.status_recipient_dept,
                            status_recipient_response=comment.comment,
                            status_recipient_email=getPost.status_recipient_email, status_recipient_user=comment.user)
comment_was_posted.connect(comment_signal, sender=Comment, dispatch_uid='lionsmatter_comment_signal')