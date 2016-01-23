from django.conf.urls import patterns, include, url
from app.views import index, post, settings, profile, login_user, delete_post, delete_comment, sort_posts, markread_notification, delete_notification, site_bug_submission, logout_user, responses_feed, agenda, closeSiteMessages, agenda_history, followPost, analytics, timeline, timeline_mark_complete, validate_vine, notification
from django.views.generic import TemplateView
from voting.views import vote_on_object
from app.models import Post
from registration.backends.default.views import ActivationView, RegistrationView
from registration.forms import RegistrationFormUniqueEmail
from django.contrib.auth import views as auth_views
from uploadProgressHandler import upload_progress
from django.contrib.comments.models import Comment
from django.conf import settings
from django.views.defaults import page_not_found

post_dict = {
    'model': Post,
    'template_object_name': 'post',
    'slug_field': 'post',
    'post_vote_redirect': "/",
    'allow_xmlhttprequest': 'true',
}
comment_dict = {
    'model': Comment,
    'template_object_name': 'comment',
    'slug_field': 'comment',
    'post_vote_redirect': "/",
    'allow_xmlhttprequest': 'true',
}


def if_development(args, kwargs):
    ret = url(args, kwargs)
    if settings.IS_PRODUCTION is True:
        ret = url(args, page_not_found)
    return ret

urlpatterns = patterns('',
    url(r'^$', index, name="home"),
    url(r'^login/$', 'django_cas.views.login', name="login"),
    url(r'^login/success/$', TemplateView.as_view(template_name='cas/success.html'), name="cas_success"),
    url(r'^login/(?P<hash>.*)/(?P<enc>.*)/$', 'django_cas.views.login_to_verify', name="login_to_verify"),
    url(r'^logout/$', logout_user, name="logout"),
    url(r'^signin/?$', login_user, name="signin"),
    url(r'^password/reset/$', auth_views.password_reset, {'template_name': 'registration/password/password_reset.html'
        , 'post_reset_redirect':'/password/reset/done', 'email_template_name':'registration/password/password_reset_email.html',
                'subject_template_name':'registration/password/password_reset_subject.txt'}, name='password_reset'),
    url(r'^password/reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', auth_views.password_reset_confirm
        , {'template_name': 'registration/password/password_reset_confirm.html'}, name='password_reset_confirm'),
    url(r'^password/reset/complete/$', auth_views.password_reset_complete
        , {'template_name': 'registration/password/password_reset_complete.html'}, name='password_reset_complete'),
    url(r'^password/reset/done/$', auth_views.password_reset_done, {'template_name': 'registration/password/password_reset_done.html'}
        , name='password_reset_done'),
    url(r'^about/?$', TemplateView.as_view(template_name='about/index.html'), name='about'),
    url(r'^report/?$', site_bug_submission, name="report"),
    url(r'^agenda/?$', agenda, name="agenda"),
    url(r'^agenda/history/?$', agenda_history, name="agenda_history"),
    url(r'^howitworks/?$', TemplateView.as_view(template_name='howitworks/index.html'), name='howitworks'),
    url(r'^help/?$', TemplateView.as_view(template_name='help/index.html'), name='help'),
    url(r'^analytics/(?P<analytics_for>users|comments|posts|votes)/?$', analytics, name="analytics"),
    url(r'^timeline/?$', timeline, name="timeline"),
    url(r'^timeline/mark/?$', timeline_mark_complete, name="timeline_mark"),
    url(r'^post/?$', post, name="post"),
    url(r'^post_progress/?$', upload_progress, name="post_progress"),
    url(r'^post/(?P<post_id>\w+)/?$', post, name="post"),
    url(r'^post/(?P<post_id>\w+)/c(?P<comment_id>\w+)/?$', post, name="comment"),
    url(r'^post/(?P<post_id>\w+)/delete/?$', delete_post, name="delete_post"),
    url(r'^post/(?P<post_id>\w+)/(?P<follow_or_unfollow>follow|unfollow)/?$', followPost, name="follow_post"),
    url(r'^sitemessages/close/$', closeSiteMessages, name="close_site_messages"),
    url(r'^notifications/?$', notification, name="notifications"),
    url(r'^notifications/(?P<notification_id>\w+)/read/?$', markread_notification, name="markread_notification"),
    url(r'^notifications/(?P<notification_id>\w+)/delete/?$', delete_notification, name="delete_notification"),
    url(r'^f/(?P<feed>\w+)/?$', index, name="feed"),
    url(r'^f/(?P<feed>\w+)/(?P<sort>highest|lowest|popularity|recent)/$', sort_posts, name="feed-sort"),
    url(r'^t/(?P<feed>\w+)/?$', index, name="special-feed"),
    url(r'^t/(?P<feed>\w+)/(?P<sort>highest|lowest|popularity|recent)/$', sort_posts, name="special-feed-sort"),
    url(r'^comments/', include('django.contrib.comments.urls')),
    url(r'^comments/(?P<comment_id>\w+)/delete/?$', delete_comment, name="delete_comment"),
    url(r'^comments/vote/(?P<object_id>\d+)/(?P<direction>up|down|clear)vote/$', vote_on_object, comment_dict, name="comments-voting"),
    url(r'^responses/?$', responses_feed, name="responses_feed"),
    url(r'^post/(?P<object_id>\d+)/(?P<direction>up|down|clear)vote/$', vote_on_object, post_dict, name="post-voting"),
    url(r'^messages/', include('threaded_messages.urls')),
    url(r'^settings/?$', 'app.views.settings', name="settings"),
    url(r'^signup/activate/complete/?$', TemplateView.as_view(template_name='registration/activation_complete.html'), name='registration_activation_complete'),
    url(r'^signup/activate/(?P<activation_key>\w+)/?$', ActivationView.as_view(), name='registration_activate'),
    url(r'^signup/?$', RegistrationView.as_view(form_class=RegistrationFormUniqueEmail), name='registration_register'),
    url(r'^signup/complete/?$', TemplateView.as_view(template_name='registration/registration_complete.html'), name='registration_complete'),
    url(r'^vine/validate/?$', validate_vine, name='validate_vine'),
    url(r'^signup/closed/?$', TemplateView.as_view(template_name='registration/registration_closed.html'), name='registration_disallowed'),
    if_development(r'^tail/', include('lionsmatter.tail-urls')),
    url(r'^(?P<username>\w+)/?$', profile, name="userprofile"),
)