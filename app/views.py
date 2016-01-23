import django.http
import json
from datetime import date
from django.template import RequestContext
from django.contrib import auth
from django.shortcuts import render, HttpResponseRedirect, Http404, HttpResponse, get_object_or_404
from app.models import Post, UserProfile, StatusUpdates, Category, Notification, SiteMessage, Timeline
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from voting.models import Vote
from generic_aggregation import generic_annotate
from django.db.models import Sum, Count
from django.utils import timezone
from django.contrib.comments.models import Comment
from django.contrib.auth.decorators import login_required
import datetime
import urllib
from django.conf import settings as lionsmatter_proj_settings
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
import urllib2
import urlparse

from .forms import NewPost, NewBug, UpdateTimeline
from .module import *


def index(request, feed=None):
    if feed == 'postsforflyer':
	recent_posts = Post.objects.filter(pk__in=[201,202,283,359,328,326,324,313]).order_by('?')
    elif feed:
        try:
            feed = Category.objects.get(shortname=feed)
            if feed.shortname == 'all':
                recent_posts = Post.objects.exclude(status__status_code_id='6').all().order_by('-timestamp')
            elif feed.is_special == 1:
                recent_posts = Post.objects.exclude(status__status_code_id='6').filter(category_id__exact=feed.id).order_by('-timestamp')
            else:
                recent_posts = Post.objects.exclude(status__status_code_id='6').filter(category_id__exact=feed.id).order_by('-timestamp')
        except Category.DoesNotExist:
            raise Http404
    else:
        posts = Post.objects.exclude(status__status_code_id='6').all().order_by('-timestamp')
        comments = Comment.objects.all()
        recent_posts = Post.objects.exclude(status__status_code_id='6').all().order_by('-timestamp')

    page_template = 'modules/recent_posts.html'
    if feed == 'postsforflyer':
	template = 'index.html'
    elif feed and feed.is_special:
        template = 'special.html'
    else:
        template = 'index.html'

    if request.is_ajax():
        return render(request, page_template, {
            'page_template': page_template,
            'recent_posts': recent_posts,
        })

    categories = Category.objects.filter(is_special=0)
    special_categories = Category.objects.filter(is_special=1, is_active=1).order_by('-special__created')
    try:
        settings = UserProfile.objects.get(user_id=request.user.id)
    except UserProfile.DoesNotExist:
        settings = None
    if request.user.is_authenticated and settings:
        if settings.last_closed_site_messages and settings.last_closed_site_messages > timezone.now()-datetime.timedelta(hours=24):
            site_messages = None
        else:
            site_messages = SiteMessage.objects.exclude(only_public=1).all().order_by('?')
    else:
        site_messages = SiteMessage.objects.exclude(only_users=1).all().order_by('-priority')

    form = NewPost()  # An unbound form

    return render(request, template, {
    'form': form,
    'feed': feed,
    'page_template': page_template,
    'site_messages': site_messages,
    'categories': categories,
    'special_categories': special_categories,
    'recent_posts': recent_posts,
    }, context_instance=RequestContext(request))


def responses_feed(request):
    alt_feed = "Responses"
    template = 'responses/index.html'
    categories = Category.objects.filter(is_special=0)
    special_categories = Category.objects.filter(is_special=1, is_active=1).order_by('-special__created')

    def next_sunday(d):
        days_ahead = 6 - d.weekday()
        if days_ahead <= 0: # Target day already happened this week
            days_ahead += 7
        return d + datetime.timedelta(days_ahead)

    def prev_sunday(d):
        days_back = d.weekday() - 6
        if days_back <= 0: # Target day already happened this week
            days_back += 7
        return d - datetime.timedelta(days_back+7)

    try:
        recent_responses = StatusUpdates.objects.exclude(status_code_id='6').exclude(status_code_id='7').exclude(status_recipient_response_obj__isnull=True).exclude(status_recipient_response_obj__exact='0').filter(status_code_id__range=('4', '9'))
        latest = recent_responses.latest('timestamp')
        current_week = [latest.timestamp.date() + datetime.timedelta(days=i) for i in range(0 - latest.timestamp.date().isoweekday(), 7 - latest.timestamp.date().isoweekday())]
        next_sunday = next_sunday(latest.date)
        prev_sunday = prev_sunday(latest.date)
    except ObjectDoesNotExist:
        recent_responses = None
        latest = [date.today() + datetime.timedelta(days=i) for i in range(0 - date.today().isoweekday(), 7 - date.today().isoweekday())]
        current_week = [prev_sunday(date.today()),next_sunday(date.today())]
        next_sunday = next_sunday(date.today())
        prev_sunday = prev_sunday(date.today())
    return render(request, template, {
        'alt_feed': alt_feed,
        'categories': categories,
        'special_categories': special_categories,
        'recent_responses': recent_responses,
        'next_sunday': next_sunday,
        'prev_sunday': prev_sunday,
        'latest_item': latest,
        'current_week': current_week,
    }, context_instance=RequestContext(request))


def post(request, post_id=None, comment_id=None, base='base.html'):
    if post_id:
        tail = False
        if request.META['HTTP_HOST'] == 'tail.lionsmatter.com':
            base = 'tail/base.html'
            tail = True
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise Http404

        if post.status.status_code_id == 6 and post.user != request.user:
            raise Http404
        else:
            statusupdates = StatusUpdates.objects.filter(post_id=post.id).order_by('-timestamp')
            if comment_id:
                try:
                    comment = Comment.objects.get(object_pk=post.pk, pk=comment_id)
                except Comment.DoesNotExist:
                    raise Http404
                return render(request, 'post/index.html', {
                    'post': post,
                    'history': statusupdates,
                    'selected_comment': comment,
                    'base': base,
                    'tail': tail,
                })
            else:
                return render(request, 'post/index.html', {
                    'post': post,
                    'history': statusupdates,
                    'base': base,
                    'tail': tail,
                })
    else:
        recent_posts = Post.objects.exclude(status__status_code_id='6').all().order_by('-timestamp')
        if request.method == 'POST': # If the form has been submitted...
            form = NewPost(request.POST, request.FILES) # A form bound to the POST data
            if form.is_valid():
                new_post = form.save(commit=False)
                new_post.user_id = request.user.id
                new_post.status_id = '1'
                new_post.save()
                new_status = StatusUpdates(post_id=new_post.pk, status_code_id='1')
                new_status.save()
                new_post_update = Post.objects.get(pk=new_post.pk)
                new_post_update.status_id = new_status.pk
                new_post_update.save(update_fields=['status_id'])
                module = 'modules/post.html'
                post = Post.objects.get(id=new_post.id)
                if request.is_ajax():
                    return HttpResponse(render_block_to_string(module, 'content', {'post': post},
                                                               RequestContext(request)))
                else:
                    return HttpResponseRedirect(reverse('post', args=[post.pk]))
            else:
                return HttpResponse(json.dumps(dict(form.errors.items())), status=400)
        else:
            form = NewPost()  # An unbound form
            return render(request, 'index.html', {
                'form': form,
                'recent_posts': recent_posts,
                }, context_instance=RequestContext(request))


@login_required(redirect_field_name=None)
def settings(request):
    if request.user.is_authenticated():
        settings = UserProfile.objects.get(user_id=request.user.id)
        user = User.objects.get(pk=request.user.id)
        if request.method == 'POST': # If the form has been submitted...
            if request.POST.get("full_name", ""):
                settings.full_name = request.POST['full_name']
                settings.save()
            elif request.POST.get("email", ""):
                if not email_re.match(request.POST['email']):
                    error = 'Must be a TCNJ email address'
                    return HttpResponse(json.dumps(error))
                elif request.POST['email'].split('@')[1] == 'tcnj.edu':
                    user.email = request.POST['email']
                    user.save()
                else:
                    error = 'Must be a TCNJ email address'
                    return HttpResponse(json.dumps(error))
            elif request.POST.get("password_new", ""):
                if not user.has_usable_password():
                    if request.POST["password_old"] == request.POST["password_new"]:
                        user.set_password(request.POST['password_new'])
                        user.save()
                    else:
                        error = 'You do not have a password. Please enter your new password in each field.'
                        return HttpResponse(json.dumps(error))
                elif not user.check_password(request.POST['password_old']):
                    error = 'Please confirm your current password'
                    return HttpResponse(json.dumps(error))
                else:
                    user.set_password(request.POST['password_new'])
                    user.save()
            elif request.POST.get("class_yr", ""):
                if '1910' < request.POST['class_yr'] < '2017':
                    settings.class_yr = request.POST['class_yr']
                    settings.save()
                else:
                    error = 'Please enter a valid class year.'
                    return HttpResponse(json.dumps(error))
            elif request.POST.get("major", ""):
                settings.major = request.POST['major']
                settings.save()
            elif request.POST.get("receive_notifications", ""):
                settings.receive_notifications = request.POST['receive_notifications']
                settings.save()
            elif request.POST.get("notification_email", ""):
                if email_re.match(request.POST['notification_email']):
                    settings.notification_email = request.POST['notification_email']
                    settings.save()
                else:
                    error = 'Please enter a valid email address.'
                    return HttpResponse(json.dumps(error))

            elif request.POST.get("display_name", ""):
                settings.display_name = request.POST['display_name']
                settings.save()
            return django.http.HttpResponseRedirect('/settings/')  # Redirect after POST

        return render(request, 'settings/index.html', {
            'settings': settings,
            }, context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect("/")


def profile(request, username=None):
    template = 'profile/index.html'
    module = 'modules/recent_posts.html'
    post_content_type = ContentType.objects.get(model='post')
    if request.is_ajax():
        template = module
    if username and username != request.user.username:
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise Http404

        userprofile = UserProfile.objects.get(user_id=user.id)
        recent_posts = Post.objects.filter(user_id__exact=user.id).exclude(user_displayname__exact='anonymous').order_by('-timestamp')
        if request.method == 'POST': # If the form has been submitted...
            if request.POST['get'] == 'posts':
                recent_posts = Post.objects.exclude(status__status_code_id='6').filter(user_id__exact=user).exclude(user_displayname__exact='anonymous').order_by('-timestamp')
                return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                           RequestContext(request)))
            if request.POST['get'] == 'comments':
                recent_comments = Comment.objects.exclude(user_name='anonymous').filter(user_id=user,content_type_id=post_content_type)
                return HttpResponse(render_block_to_string('modules/recent_comments.html', 'content', {'recent_comments': recent_comments},
                                                           RequestContext(request)))
            if request.POST['get'] == 'upvotes' and request.user.id == user.id:
                upvoted_posts_pks = Vote.objects.filter(user_id=user, vote='1').values_list('object_id')
                recent_posts = Post.objects.filter(id__in=upvoted_posts_pks).exclude(status__status_code_id='6')
                return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                           RequestContext(request)))
            if request.POST['get'] == 'downvotes' and request.user.id == user.id:
                downvoted_posts_pks = Vote.objects.filter(user_id=user, vote='-1').values_list('object_id')
                recent_posts = Post.objects.filter(id__in=downvoted_posts_pks).exclude(status__status_code_id='6')
                return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                           RequestContext(request)))
            if request.POST['get'] == 'votes' and request.user.id == user.id:
                voted_posts_pks = Vote.objects.filter(user_id=user).values_list('object_id')
                recent_posts = Post.objects.filter(id__in=voted_posts_pks).exclude(status__status_code_id='6')
                return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                           RequestContext(request)))
    elif request.user.is_authenticated() or (username and username == request.user.username):
            user = request.user.id
            username = request.user.username
            userprofile = UserProfile.objects.get(user_id=user)
            recent_posts = Post.objects.filter(user_id__exact=user).order_by('-timestamp')

            if request.method == 'POST': # If the form has been submitted...
                if request.POST['get'] == 'posts':
                    recent_posts = Post.objects.filter(user_id__exact=user).order_by('-timestamp')
                    return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                               RequestContext(request)))
                if request.POST['get'] == 'comments':
                    recent_comments = Comment.objects.filter(user_id=user,content_type_id=post_content_type)
                    return HttpResponse(render_block_to_string('modules/recent_comments.html', 'content', {'recent_comments': recent_comments},
                                                               RequestContext(request)))
                if request.POST['get'] == 'upvotes':
                    upvoted_posts_pks = Vote.objects.filter(user_id=user, vote='1').values_list('object_id')
                    recent_posts = Post.objects.exclude(status__status_code_id='6').filter(id__in=upvoted_posts_pks)
                    return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                               RequestContext(request)))
                if request.POST['get'] == 'downvotes':
                    downvoted_posts_pks = Vote.objects.filter(user_id=user, vote='-1').values_list('object_id')
                    recent_posts = Post.objects.exclude(status__status_code_id='6').filter(id__in=downvoted_posts_pks)
                    return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                               RequestContext(request)))
                if request.POST['get'] == 'votes':
                    voted_posts_pks = Vote.objects.filter(user_id=user).values_list('object_id')
                    recent_posts = Post.objects.exclude(status__status_code_id='6').filter(id__in=voted_posts_pks)
                    return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts},
                                                               RequestContext(request)))
                if request.POST['get'] == 'agreed_to_terms':
                    if userprofile.agreed_to_terms == None or False:
                        userprofile.agreed_to_terms = True
                        userprofile.save()
    else:
        recent_posts = None
        userprofile = None

    categories = Category.objects.filter(is_special=0)

    return render(request, template, {
    'page_template': module,
    'username': username,
    'recent_posts': recent_posts,
    'userprofile': userprofile,
    'categories': categories,
    }, context_instance=RequestContext(request))


def login_user(request):
    if request.method == 'POST': # If the form has been submitted...
        email = request.POST['email']
        password = request.POST['password']
        username = email.split('@')[0]
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            error = 'Incorrect email or password.  Please try again.'
            return HttpResponse(json.dumps(error))
        user = authenticate(username=username, password=password)
        check_password = User.objects.get(username=username)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect("/")
            else:
                error = 'Please check your email to activate your account'
                return HttpResponse(json.dumps(error))
        elif check_password.has_usable_password() is False:
            error = 'Your account does not have an active password.  ' \
                    'Please <a href="/login/" class="alert-link">Login with TCNJ</a> and set your password ' \
                    'under \'Settings\' after logging in.'
            return HttpResponse(json.dumps(error))
        else:
            error = 'Incorrect email or password.  Please try again.'
            return HttpResponse(json.dumps(error))
    else:
        return HttpResponseRedirect("/")


def logout_user(request):
    auth.logout(request)
    return HttpResponseRedirect("/")


def site_bug_submission(request):
    success = 'False'
    if request.method == 'POST': # If the form has been submitted...
        form = NewBug(request.POST, request.FILES) # A form bound to the POST data
        if form.is_valid():
            new_bug = form.save(commit=False)
            new_bug.save()
            success = 'True'
    else:
        form = NewBug()  # An unbound form

    return render(request, 'report/index.html', {
        'form': form,
        'success': success,
        }, context_instance=RequestContext(request))


def sort_posts(request, feed=None, sort=None):
    if feed:
        try:
            feed = Category.objects.get(shortname=feed)
            if feed.shortname == 'all':
                template = 'index.html'
                posts_unsorted = Post.objects.exclude(status__status_code_id='6').all()
                if sort == 'recent':
                    recent_posts = posts_unsorted.order_by('-timestamp')
                elif sort == 'highest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('-score')
                elif sort == 'lowest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('score')
                elif sort == 'popularity':
                    recent_posts = sorted(posts_unsorted, key=lambda post: post.popularity, reverse=True)
            elif feed.is_special == 1:
                template = 'special.html'
                posts_unsorted = Post.objects.exclude(status__status_code_id='6').filter(category_id__exact=feed.id)
                if sort == 'recent':
                    recent_posts = posts_unsorted.order_by('-timestamp')
                elif sort == 'highest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('-score')
                elif sort == 'lowest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('score')
                elif sort == 'popularity':
                    recent_posts = sorted(posts_unsorted, key=lambda post: post.popularity, reverse=True)
            else:
                template = 'index.html'
                posts_unsorted = Post.objects.exclude(status__status_code_id='6').filter(category_id__exact=feed.id)
                if sort == 'recent':
                    recent_posts = posts_unsorted.order_by('-timestamp')
                elif sort == 'highest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('-score')
                elif sort == 'lowest':
                    recent_posts = generic_annotate(posts_unsorted, Vote.objects.filter(object_id__in=posts_unsorted), Sum('vote')).order_by('score')
                elif sort == 'popularity':
                    recent_posts = sorted(posts_unsorted, key=lambda post: post.popularity, reverse=True)
            if request.is_ajax():
                module = 'modules/recent_posts.html'
                return HttpResponse(render_block_to_string(module, 'content', {'recent_posts': recent_posts, 'sort': sort},
                                                           RequestContext(request)))
            else:
                categories = Category.objects.filter(is_special=0)
                special_categories = Category.objects.filter(is_special=1, is_active=1)
                form = NewPost()  # An unbound form

                return render(request, template, {
                    'form': form,
                    'feed': feed,
                    'categories': categories,
                    'sort': sort,
                    'special_categories': special_categories,
                    'recent_posts': recent_posts,
                }, context_instance=RequestContext(request))

        except Category.DoesNotExist:
            raise Http404
    else:
        raise Http404


def agenda(request):
    alt_feed = "Agenda"
    template = 'agenda/index.html'
    categories = Category.objects.filter(is_special=0)
    special_categories = Category.objects.filter(is_special=1, is_active=1).order_by('-special__created')
    sorted_posts = Post.objects.filter(status__status_code_id__in=[2,3,7]).order_by('-status__timestamp')

    latest = sorted_posts.latest('status__timestamp')
    current_week = [latest.status.timestamp.date() + datetime.timedelta(days=i) for i in range(0 - latest.status.timestamp.date().isoweekday(), 7 - latest.status.timestamp.date().isoweekday())]

    def next_sunday(d):
        days_ahead = 6 - d.weekday()
        if days_ahead <= 0: # Target day already happened this week
            days_ahead += 7
        return d + datetime.timedelta(days_ahead)

    def prev_sunday(d):
        days_back = d.weekday() - 6
        if days_back <= 0: # Target day already happened this week
            days_back += 7
        return d - datetime.timedelta(days_back+7)

    return render(request, template, {
        'alt_feed': alt_feed,
        'categories': categories,
        'special_categories': special_categories,
        'next_sunday': next_sunday(latest.status.date),
        'prev_sunday': prev_sunday(latest.status.date),
        'latest_item': latest,
        'current_week': current_week,
        'sorted_posts': sorted_posts,
    }, context_instance=RequestContext(request))


def agenda_history(request):
    alt_feed = "History"
    template = 'agenda/history.html'
    categories = Category.objects.filter(is_special=0)
    special_categories = Category.objects.filter(is_special=1, is_active=1).order_by('-special__created')
    all_history_items = StatusUpdates.objects.filter(~Q(status_code_id = 1))

    latest = all_history_items.latest('timestamp')
    current_week = [latest.timestamp.date() + datetime.timedelta(days=i) for i in range(0 - latest.timestamp.date().isoweekday(), 7 - latest.timestamp.date().isoweekday())]

    def next_sunday(d):
        days_ahead = 6 - d.weekday()
        if days_ahead <= 0: # Target day already happened this week
            days_ahead += 7
        return d + datetime.timedelta(days_ahead)

    def prev_sunday(d):
        days_back = d.weekday() - 6
        if days_back <= 0: # Target day already happened this week
            days_back += 7
        return d - datetime.timedelta(days_back+7)

    return render(request, template, {
        'alt_feed': alt_feed,
        'categories': categories,
        'special_categories': special_categories,
        'next_sunday': next_sunday(latest.date),
        'prev_sunday': prev_sunday(latest.date),
        'latest_item': latest,
        'current_week': current_week,
        'all_history_items': all_history_items,
    }, context_instance=RequestContext(request))


def delete_post(request, post_id):
    user = request.user.id
    post = get_object_or_404(Post, id=post_id)
    if request.user.is_authenticated and user == post.user_id and request.is_ajax():
        post.delete()
        Vote.objects.filter(object_id=post_id).delete()
        Comment.objects.filter(object_pk=post_id).delete()
        Notification.objects.filter(post=post_id).delete()
        return HttpResponse("Success")
    else:
        raise Http404


def delete_comment(request, comment_id):
    user = request.user.id
    comment = get_object_or_404(Comment, id=comment_id)
    if request.user.is_authenticated and user == comment.user_id and request.is_ajax():
        comment.delete()
        return HttpResponse("Success")
    else:
        raise Http404


def notification(request, base='base.html'):
    if request.META['HTTP_HOST'] == 'tail.lionsmatter.com':
        base = 'tail/base.html'
        return render(request, 'notifications/index.html', {'base': base, 'tail': True}, context_instance=RequestContext(request))
    else:
        return render(request, 'notifications/index.html', {'base': base, 'tail': False}, context_instance=RequestContext(request))


def delete_notification(request, notification_id):
    user = request.user.id
    notification = get_object_or_404(Notification, id=notification_id)
    if request.user.is_authenticated and user == notification.user_id and request.is_ajax():
        notification.delete()
        return HttpResponse("Success")
    else:
        raise Http404


def markread_notification(request, notification_id):
    user = request.user.id
    notification = get_object_or_404(Notification, id=notification_id)
    if request.user.is_authenticated and user == notification.user_id and request.is_ajax():
        notification.notified=1
        notification.save()
        return HttpResponse("Success")
    else:
        raise Http404


def closeSiteMessages(request):
    user = request.user.id
    settings = UserProfile.objects.get(user=user)
    if request.user.is_authenticated and request.is_ajax():
        if settings.last_closed_site_messages:
            if settings.last_closed_site_messages < timezone.now()-datetime.timedelta(hours=24):
                settings.last_closed_site_messages = datetime.datetime.now()
                settings.save(update_fields=['last_closed_site_messages'])
        else:
            settings.last_closed_site_messages = datetime.datetime.now()
            settings.save(update_fields=['last_closed_site_messages'])
        return HttpResponse('Success')
    else:
        raise Http404


def followPost(request, follow_or_unfollow, post_id):
    if request.user.is_authenticated and request.is_ajax():
        user = User.objects.get(id=request.user.id)
        post = Post.objects.get(id=post_id)
        if follow_or_unfollow == 'unfollow' and user.followers.filter(id=post_id).exists():
            post.followers.remove(user)
        elif follow_or_unfollow == 'follow':
            post.followers.add(user)
        return HttpResponse("Success")
    else:
        raise Http404


def timeline(request):
    if request.method == 'POST' and request.user.is_authenticated and request.user.is_staff:  # If the form has been submitted...
        form = UpdateTimeline(request.POST)  # A form bound to the POST data
        user = User.objects.get(pk=request.user.id)
        if form.is_valid():
            new_timeline_update = form.save(commit=False)
            new_timeline_update.submitted_by = user
            new_timeline_update.save()
            return HttpResponse(json.dumps({'success': True}), content_type='application/json')
        else:
            return HttpResponse(json.dumps(form.errors), status=400)
    else:
        form = UpdateTimeline()  # An unbound form
        todo = Timeline.objects.filter(type='todo', is_completed=False)
        bugs_and_breaks = Timeline.objects.filter(type='break', is_completed=False)
        suggestions = Timeline.objects.filter(type='suggestion', is_completed=False)
        html = Timeline.objects.filter(type='html', is_completed=False)
        css = Timeline.objects.filter(type='css', is_completed=False)
        js = Timeline.objects.filter(type='js', is_completed=False)
        python = Timeline.objects.filter(type='python', is_completed=False)
        completed = Timeline.objects.filter(is_completed=True)
        return render(request, 'timeline/index.html', {
            'form': form,
            'todo': todo,
            'bugs_and_breaks': bugs_and_breaks,
            'suggestions': suggestions,
            'html': html,
            'css': css,
            'js': js,
            'python': python,
            'completed': completed,
        }, context_instance=RequestContext(request))


def timeline_mark_complete(request):
    if request.is_ajax():
        if request.POST.get("id", ""):
            obj = get_object_or_404(Timeline, pk=request.POST.get("id", ""))
            if request.POST.get("status", "") and request.POST.get("status", "") == 'iscomplete':
                obj.is_completed = True

                obj.save(update_fields=['is_completed'])
                return HttpResponse(json.dumps({'success': True}), content_type='application/json')
            elif request.POST.get("status", "") and request.POST.get("status", "") == 'isnotcomplete':
                obj.is_completed = False
                obj.save(update_fields=['is_completed'])
                return HttpResponse(json.dumps({'success': True}), content_type='application/json')
        else:
            raise Http404
    else:
        raise Http404


def analytics(request, analytics_for=None):
    from dateutil.relativedelta import relativedelta
    today = date.today()
    tomorrow = today + relativedelta(days = +1)
    yesterday = today + relativedelta(days = -1)
    three_days_ago = today + relativedelta(days = -3)
    seven_days_ago = today + relativedelta(days = -7)
    one_month_ago = today + relativedelta(months = -1)
    if analytics_for == 'comments':
        graph = Comment.objects.extra({'date': "date(submit_date)"}).values('date').annotate(count=Count('id'))
        active_today = 0
        new_today = Comment.objects.filter(submit_date__year=today.year, submit_date__month=today.month, submit_date__day=today.day).count()
        total = Comment.objects.all().count()
        since_yesterday =  Comment.objects.filter(submit_date__range=[yesterday, tomorrow]).count()
        since_three_days = Comment.objects.filter(submit_date__range=[three_days_ago, tomorrow]).count()
        since_seven_days = Comment.objects.filter(submit_date__range=[seven_days_ago, tomorrow]).count()
        since_one_month = Comment.objects.filter(submit_date__range=[one_month_ago, tomorrow]).count()
    elif analytics_for == 'users':
        graph = User.objects.extra({'date': "date(date_joined)"}).values('date').annotate(count=Count('id'))
        active_today = UserProfile.objects.filter(last_active__year=today.year, last_active__month=today.month, last_active__day=today.day).count()
        new_today = User.objects.filter(date_joined__year=today.year, date_joined__month=today.month, date_joined__day=today.day).count()
        total = User.objects.all().count()
        since_yesterday =  User.objects.filter(date_joined__range=[yesterday, tomorrow]).count()
        since_three_days = User.objects.filter(date_joined__range=[three_days_ago, tomorrow]).count()
        since_seven_days = User.objects.filter(date_joined__range=[seven_days_ago, tomorrow]).count()
        since_one_month = User.objects.filter(date_joined__range=[one_month_ago, tomorrow]).count()
    elif analytics_for == 'votes':
        active_today = 0
        new_today = Notification.objects.filter(timestamp__year=today.year, timestamp__month=today.month, timestamp__day=today.day).count()
        graph = Notification.objects.filter(notification_type='vote').extra({'date': "date(timestamp)"}).values('date').annotate(count=Count('id'))
        total = Vote.objects.all().count()
        since_yesterday =  Notification.objects.filter(notification_type='vote', timestamp__range=[yesterday, tomorrow]).count()
        since_three_days = Notification.objects.filter(notification_type='vote', timestamp__range=[three_days_ago, tomorrow]).count()
        since_seven_days = Notification.objects.filter(notification_type='vote', timestamp__range=[seven_days_ago, tomorrow]).count()
        since_one_month = Notification.objects.filter(notification_type='vote', timestamp__range=[one_month_ago, tomorrow]).count()
    elif analytics_for == 'posts':
        active_today = 0
        new_today = Post.objects.filter(timestamp__year=today.year, timestamp__month=today.month, timestamp__day=today.day).count()
        graph = Post.objects.extra({'date': "date(timestamp)"}).values('date').annotate(count=Count('id'))
        total = Post.objects.all().count()
        since_yesterday =  Post.objects.filter(timestamp__range=[yesterday, tomorrow]).count()
        since_three_days = Post.objects.filter(timestamp__range=[three_days_ago, tomorrow]).count()
        since_seven_days = Post.objects.filter(timestamp__range=[seven_days_ago, tomorrow]).count()
        since_one_month = Post.objects.filter(timestamp__range=[one_month_ago, tomorrow]).count()
    else:
        return render(request, 'analytics/index.html', {}, context_instance=RequestContext(request))
    print graph
    return render(request, 'analytics/analytics.html', {
        'analytics_for': analytics_for,
        'graph': graph,
        'new_today': new_today,
        'active_today': active_today,
        'total': total,
        'since_yesterday': since_yesterday,
        'since_three_days': since_three_days,
        'since_seven_days': since_seven_days,
        'since_one_month': since_one_month
    }, context_instance=RequestContext(request))


def validate_vine(request):
    if request.method == "POST" and request.is_ajax():
        if request.POST.get("vine_url", ""):
            query = urlparse.urlparse(request.POST.get("vine_url", ""))
            if query.hostname == 'vine.co':
                if query.path.split('/')[1] == 'v' and query.path.split('/')[2]:
                    if urllib.urlopen('https://vine.co/api/timelines/posts/s/'+query.path.split('/')[2]).getcode() == 200:
                        return HttpResponse(json.dumps({'success': True, 'vine_url': 'https://vine.co/v/'+query.path.split('/')[2]}), content_type='application/json')
                    else:
                        return HttpResponse(json.dumps({'success': False}), status=400)
                else:
                    return HttpResponse(json.dumps({'success': False}), status=400)
            else:
                return HttpResponse(json.dumps({'success': False}), status=400)
        else:
            raise Http404
    else:
        raise Http404