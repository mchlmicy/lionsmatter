from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib import admin
from app.tail_views import index, settings, respond
from app.views import markread_notification, delete_notification, delete_comment, followPost, post

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', index, name="tail_home"),
    url(r'^login/$', 'django_cas.views.login', name="login"),
    url(r'^login/success/$', TemplateView.as_view(template_name='tail/cas/success.html'), name="cas_success"),
    url(r'^logout/$', 'django_cas.views.logout', name="logout"),
    url(r'^about/$', TemplateView.as_view(template_name='tail/about/index.html'), name="tail_about"),
    url(r'^notifications/?$', TemplateView.as_view(template_name='notifications/index.html'), name="notifications"),
    url(r'^notifications/(?P<notification_id>\w+)/read/?$', markread_notification, name="markread_notification"),
    url(r'^notifications/(?P<notification_id>\w+)/delete/?$', delete_notification, name="delete_notification"),
    url(r'^post/(?P<post_id>\w+)/?$', post, name="tail_post"),
    url(r'^post/(?P<post_id>\w+)/c(?P<comment_id>\w+)/?$', post, name="comment"),
    url(r'^post/(?P<post_id>\w+)/(?P<follow_or_unfollow>follow|unfollow)/?$', followPost, name="follow_post"),
    url(r'^f/(?P<feed>\w+)/?$', index, name="tail_feed"),
    url(r'^messages/', include('threaded_messages.urls')),
    url(r'^respond/(?P<post_id>\w+)/?$', respond, name="respond"),
    url(r'^comments/', include('django.contrib.comments.urls')),
    url(r'^comments/(?P<comment_id>\w+)/delete/?$', delete_comment, name="delete_comment"),
    url(r'^settings/?$', settings, name="settings"),
    ('^dashboard/', include(admin.site.urls)),
)