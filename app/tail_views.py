import json
import django.http
from django.shortcuts import render, Http404, HttpResponseRedirect, HttpResponse, get_object_or_404
from django.template import RequestContext
from app.models import Post, UserProfile, StatusUpdates, Notification, Category
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.core.validators import email_re
from django.core.mail import EmailMultiAlternatives
from .forms import NewTailResponse
from django.utils.html import strip_tags
from django.contrib.comments.models import Comment
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q


def index(request, feed=None):
    checkUser = str(request.user.username+'@tcnj.edu')
    try:
        user = User.objects.get(username=request.user.username)
    except User.DoesNotExist:
        user = None
    if feed:
        if feed == 'all':
            recent_posts = Post.objects.exclude(status__status_code_id='6').filter(status__status_recipient_email=checkUser).order_by('-timestamp')
        elif feed == 'queue':
            recent_posts = Post.objects.exclude(status__status_code_id='6').filter(status__status_recipient_email=checkUser, status__status_code_id='3').order_by('-timestamp')
        elif feed == 'responded':
            recent_posts = Post.objects.exclude(status__status_code_id='6').filter(status__status_recipient_user=user).order_by('-timestamp')
        else:
            raise Http404
    else:
        recent_posts = Post.objects.exclude(status__status_code_id='6').filter(Q(status__status_recipient_user=user) | Q(status__status_recipient_email=checkUser)).order_by('-timestamp')

    if request.user.is_authenticated():
        template = 'tail/index.html'
    else:
        template = 'tail/about/index.html'
    page_template = 'tail/modules/recent_posts.html'
    if request.is_ajax():
        return render(request, page_template, {
            'page_template': page_template,
            'recent_posts': recent_posts,
        })
    return render(request, template, {
    'recent_posts': recent_posts,
    'page_template': page_template
    }, context_instance=RequestContext(request))


@login_required(login_url='/login/')
def settings(request):
    if request.user.is_authenticated():
        settings = UserProfile.objects.get(user_id=request.user.id)
        user = User.objects.get(pk=request.user.id)
        if request.method == 'POST': # If the form has been submitted...
            if request.POST.get("full_name", ""):
                settings.full_name = request.POST['full_name']
                settings.save()
            elif request.POST.get("position", ""):
                settings.staff_position = request.POST['position']
                settings.save()
            elif request.POST.get("bio", ""):
                settings.bio = request.POST['bio']
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

            return django.http.HttpResponseRedirect('/settings/')  # Redirect after POST

        return render(request, 'tail/settings/index.html', {
            'settings': settings
            }, context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect("/")


@login_required(login_url='/login/')
def respond(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    status = StatusUpdates.objects.get(pk=post.status.pk)
    check_user = post.status.status_recipient_email
    postUserProfile = UserProfile.objects.get(user=post.user)
    profile = UserProfile.objects.get(user=request.user)
    post_content_type = ContentType.objects.get(model='post')
    if check_user.split('@')[0] == request.user.username and 3 <= post.status.status_code.id <= 5:
        if request.method == 'POST': # If the form has been submitted...
            form = NewTailResponse(request.POST) # A form bound to the POST data
            if form.is_valid():
                if not profile.is_college_staff:
                    profile.is_college_staff = True
                    profile.save(update_fields=['is_college_staff'])
                if form.data['position']:
                    profile.staff_position = form.data['position']
                    profile.save(update_fields=['staff_position'])
                if not profile.full_name:
                    profile.full_name = form.data['name']
                    profile.save(update_fields=['full_name'])
                if not profile.department:
                    profile.department = form.cleaned_data['department']
                    profile.save(update_fields=['department'])
                if status.status_code.id == 4 or 5:
                    new_response_update = StatusUpdates.objects.create(post=post, status_code_id='5'
                        , status_recipient_dept=status.status_recipient_dept,
                            status_recipient_response=form.cleaned_data['response'],
                            status_recipient_email=status.status_recipient_email, status_recipient_user=request.user)
                elif status.status_code.id == 3:
                    new_response_update = StatusUpdates.objects.create(post=post, status_code_id='4'
                        , status_recipient_dept=status.status_recipient_dept,
                            status_recipient_response=form.cleaned_data['response'],
                            status_recipient_email=status.status_recipient_email, status_recipient_user=request.user)
                new_comment = Comment.objects.create(user=request.user, object_pk=post.pk, user_name=profile.full_name, comment=form.data['response'], content_type_id=post_content_type.id, submit_date=timezone.now(), site_id='1', is_public=True, is_removed=False)
                new_response_update.status_recipient_response_obj = new_comment
                new_response_update.save()
                post.status_id = new_response_update.pk
                post.save(update_fields=['status_id'])
                if post.status.status_code.id == 4 or 5:
                    postLink = reverse('post', args=[post.pk])
                    # Generate the notification
                    notification = Notification.objects.create(actor=request.user, notification_type='status', post_id=post.id, user_id=post.user_id, content=str(status.status_recipient_dept)+" has responded to your post!")
                    # Send an email to the user
                    if postUserProfile.receive_notifications == 1:
                        html_content = render_to_string('email/new_response.html', {'status':new_response_update,'user':post.user,'postLink':postLink})
                        text_content = strip_tags(html_content) # this strips the html, so people will have the text as well.

                        # create the email, and attach the HTML version as well.
                        msg = EmailMultiAlternatives('Status Update on Your Post', text_content, 'Lionsmatter@lionsmatter.com', [profile.notification_email])
                        msg.attach_alternative(html_content, "text/html")
                        msg.send()
                return render(request, 'tail/respond/success.html', context_instance=RequestContext(request))
        else:
            if post.status.status_recipient_dept:
                form = NewTailResponse(initial={'department': post.status.status_recipient_dept.pk})  # An unbound form
            else:
                form = NewTailResponse()  # An unbound form
        return render(request, 'tail/respond/index.html', {
                'post': post,
                'form': form,
                }, context_instance=RequestContext(request))
    elif post.status.status_code.id < 3 or post.status.status_code.id > 5:
        return render(request, 'tail/respond/not_available.html', context_instance=RequestContext(request))
    else:
        return render(request, 'tail/respond/wrong_user.html', context_instance=RequestContext(request))