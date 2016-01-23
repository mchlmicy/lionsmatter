from django.contrib import admin
from app.models import Post, UserProfile, StatusUpdates, Notification, SiteMessage, GlobalSettings, SiteBug, Department, Category, SpecialCategory
from django.conf.urls import patterns
from django.template import RequestContext
from django.shortcuts import render, HttpResponse, Http404
from voting.models import Vote
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.contrib.auth.admin import UserAdmin
from django.contrib.comments.models import Comment
from django.contrib.comments.admin import CommentsAdmin
from registration.models import RegistrationProfile
from threaded_messages.models import Thread, Message, Participant
from .forms import UpdatePostStatus
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.forms import TextInput, Textarea
from django.db import models

admin.site.register(Department)
admin.site.register(Category)
admin.site.register(SpecialCategory)
admin.site.unregister(Site)
admin.site.unregister(Thread)
admin.site.unregister(Message)
admin.site.unregister(Participant)
admin.site.unregister(Vote)
admin.site.unregister(RegistrationProfile)


class PostAdmin(admin.ModelAdmin):
    list_display = ['post','rating','num_votes','status_code','update_status']
    ordering = ['-timestamp']
    list_filter = ('status__status_code','category')

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('status', 'timestamp', 'user_displayname')
        return self.readonly_fields

    def get_form(self, request, obj=None, **kwargs):
        if obj and obj.user_displayname == 'anonymous':
            kwargs.update({
                'exclude': getattr(kwargs, 'exclude', tuple()) + ('user','status','timestamp','user_displayname'),
            })
        return super(PostAdmin, self).get_form(request, obj, **kwargs)

    def update_status(self, obj):
        return '<a href="%s%s%s">%s</a>' % ('http://tail.lionsmatter.com/dashboard/app/post/', obj.id, '/status/', 'Update')
    update_status.allow_tags = True
    update_status.short_description = 'Update Status'

    def get_urls(self):
        urls = super(PostAdmin, self).get_urls()
        status_url = patterns('',
            (r'^(?P<post_id>\w+)/status/$', self.status_view)
        )
        return status_url + urls

    def status_view(self, request, post_id):
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise Http404
        statusUser = UserProfile.objects.get(user=post.user_id)
        try:
            status = StatusUpdates.objects.get(pk=post.status_id)
        except StatusUpdates.DoesNotExist:
            status = None
        if request.method == 'POST':
            form = UpdatePostStatus(request.POST)  # A form bound to the POST data
            if form.is_valid():
                if form.data['status_code'] == '2':
                    new_status = StatusUpdates.objects.create(post_id=post.id, status_code_id=form.data['status_code'], status_recipient_dept=form.cleaned_data['status_recipient_dept'])
                elif form.data['status_code'] == '3':
                    try:
                        status_recipient_user = User.objects.get(email=form.cleaned_data['status_recipient_email'])
                    except User.DoesNotExist:
                        status_recipient_user = None
                    new_status = StatusUpdates.objects.create(post_id=post.id, status_code_id=form.data['status_code'], status_recipient_dept=form.cleaned_data['status_recipient_dept'], status_recipient_email=form.cleaned_data['status_recipient_email'], status_recipient_user=status_recipient_user)
                    notification = Notification.objects.create(actor='LionsMatter', notification_type='status', post_id=post.id, user_id=post.user_id, content="Your post has been forwarded to "+str(new_status.status_recipient_dept.name))
                elif form.data['status_code'] == '6':
                    new_status = StatusUpdates.objects.create(post_id=post.id, status_code_id=form.data['status_code'], flag=form.data['flag'])
                    notification = Notification.objects.create(actor='LionsMatter', notification_type='status', post_id=post.id, user_id=post.user_id, content="Your post has been flagged and is no longer visible to the public.  Please see your post's history for more details.")
                else:
                    new_status = StatusUpdates.objects.create(post_id=post.id, status_code_id=form.data['status_code'])
                post.status_id = new_status.pk
                post.save(update_fields=['status_id'])
                if statusUser.receive_notifications == 1 and new_status.status_code.id == 3 or new_status.status_code.id == 6:
                    html_content = render_to_string('email/new_status.html', {'status':new_status,'user':post.user})
                    text_content = strip_tags(html_content) # this strips the html, so people will have the text as well.

                    # Create the email, and attach the HTML version as well.
                    msg = EmailMultiAlternatives('Status Update on Your Post', text_content, 'Lionsmatter@lionsmatter.com', [statusUser.notification_email])
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()

                return render(request, 'tail/status/status_update_success.html', {'status': new_status,}, context_instance=RequestContext(request))
        else:
            if status.status_recipient_dept:
                form = UpdatePostStatus(initial={'status_code': status.status_code.id,
                                             'status_recipient_dept': status.status_recipient_dept})  # An unbound form
            else:
                form = UpdatePostStatus(initial={'status_code': status})  # An unbound form
        return render(request, 'tail/status/status_update.html', {
            'form': form,
            'post': post,
            'status': status,
        }, context_instance=RequestContext(request))

    def status_code(self, obj):
        return obj.status.status_code.code
    status_code.short_description = 'Status'

    def rating(self, obj):
        return Vote.objects.get_score(obj)['score']
    rating.short_description = 'Rating'

    def num_votes(self, obj):
        return Vote.objects.get_score(obj)['num_votes']
    num_votes.short_description = '# Votes'

admin.site.register(Post, PostAdmin)


class UserAdmin(UserAdmin):
    list_display = ['username','total_posts','total_comments','total_votes','last_active','is_staff']
    list_filter = ('profile__last_active','is_superuser','is_active')

    def total_posts(self, obj):
        return Post.objects.filter(user=obj).count()
    total_posts.short_description = 'Posts'

    def total_comments(self, obj):
        return Comment.objects.filter(user=obj).count()
    total_comments.short_description = 'Comments'

    def total_votes(self, obj):
        return Vote.objects.filter(user=obj).count()
    total_votes.short_description = 'Votes'

    def last_active(self, obj):
        return UserProfile.objects.get(user=obj).last_active
    last_active.short_description = 'Last Active'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)


class CommentAdmin(CommentsAdmin):
    list_display = ('comment','name', 'post', 'submit_date')

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('object_pk', 'content_type', 'comment' ,'user_name', 'submit_date')
        return self.readonly_fields

    def post(self, obj):
        post = Post.objects.get(pk=obj.object_pk)
        return '<a href="%s%s%s">%s</a>' % ('http://tail.lionsmatter.com/dashboard/app/post/', post.id, '/', post.id)
    post.allow_tags = True
    post.short_description = 'Post'

admin.site.unregister(Comment)
admin.site.register(Comment, CommentAdmin)


class SiteMessageAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.CharField: {'widget': Textarea(attrs={'rows':4, 'cols':40})},
    }
admin.site.register(SiteMessage, SiteMessageAdmin)


class GlobalSettingsAdmin(admin.ModelAdmin):
    list_display = ('name','value')

    def get_form(self, request, obj=None, **kwargs):
        self.readonly_fields = ('name','slug',)
        return super(GlobalSettingsAdmin, self).get_form(request, obj, **kwargs)

admin.site.register(GlobalSettings, GlobalSettingsAdmin)


class SiteBugAdmin(admin.ModelAdmin):
    list_display = ('title','description','timestamp')

admin.site.register(SiteBug, SiteBugAdmin)