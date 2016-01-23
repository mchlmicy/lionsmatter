from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.contrib.auth.views import redirect_to_login
from django.template import loader, RequestContext
from django.template.loader import render_to_string
from django.utils import simplejson
from decimal import Decimal, ROUND_DOWN
from voting.models import Vote
from django.core.mail import EmailMultiAlternatives
from django.core.urlresolvers import reverse
from django.utils.html import strip_tags
from app.models import UserProfile
from django.contrib.contenttypes.models import ContentType

VOTE_DIRECTIONS = (('up', 1), ('down', -1), ('clear', 0))

def vote_on_object(request, model, direction, post_vote_redirect=None,
        object_id=None, slug=None, slug_field=None, template_name=None,
        template_loader=loader, extra_context=None, context_processors=None,
        template_object_name='object', allow_xmlhttprequest=False):
    """
    Generic object vote function.

    The given template will be used to confirm the vote if this view is
    fetched using GET; vote registration will only be performed if this
    view is POSTed.

    If ``allow_xmlhttprequest`` is ``True`` and an XMLHttpRequest is
    detected by examining the ``HTTP_X_REQUESTED_WITH`` header, the
    ``xmlhttp_vote_on_object`` view will be used to process the
    request - this makes it trivial to implement voting via
    XMLHttpRequest with a fallback for users who don't have JavaScript
    enabled.

    Templates:``<app_label>/<model_name>_confirm_vote.html``
    Context:
        object
            The object being voted on.
        direction
            The type of vote which will be registered for the object.
    """
    if allow_xmlhttprequest and request.is_ajax():
        return xmlhttprequest_vote_on_object(request, model, direction,
                                             object_id=object_id, slug=slug,
                                             slug_field=slug_field)

    if extra_context is None: extra_context = {}
    if not request.user.is_authenticated():
        return redirect_to_login(request.path)

    try:
        vote = dict(VOTE_DIRECTIONS)[direction]
    except KeyError:
        raise AttributeError("'%s' is not a valid vote type." % vote_type)

    # Look up the object to be voted on
    lookup_kwargs = {}
    if object_id:
        lookup_kwargs['%s__exact' % model._meta.pk.name] = object_id
    elif slug and slug_field:
        lookup_kwargs['%s__exact' % slug_field] = slug
    else:
        raise AttributeError('Generic vote view must be called with either '
                             'object_id or slug and slug_field.')
    try:
        obj = model._default_manager.get(**lookup_kwargs)
    except ObjectDoesNotExist:
        raise Http404, 'No %s found for %s.' % (model._meta.app_label, lookup_kwargs)

    if request.method == 'POST':
        if post_vote_redirect is not None:
            next = post_vote_redirect
        elif request.REQUEST.has_key('next'):
            next = request.REQUEST['next']
        elif hasattr(obj, 'get_absolute_url'):
            if callable(getattr(obj, 'get_absolute_url')):
                next = obj.get_absolute_url()
            else:
                next = obj.get_absolute_url
        else:
            raise AttributeError('Generic vote view must be called with either '
                                 'post_vote_redirect, a "next" parameter in '
                                 'the request, or the object being voted on '
                                 'must define a get_absolute_url method or '
                                 'property.')
        Vote.objects.record_vote(obj, request.user, vote)
        return HttpResponseRedirect(next)
    else:
        if not template_name:
            template_name = 'post/post_confirm_vote.html'
        t = template_loader.get_template(template_name)
        c = RequestContext(request, {
            template_object_name: obj,
            'direction': direction,
        }, context_processors)
        for key, value in extra_context.items():
            if callable(value):
                c[key] = value()
            else:
                c[key] = value
        response = HttpResponse(t.render(c))
        return response

def json_error_response(error_message):
    return HttpResponse(simplejson.dumps(dict(success=False,
                                              error_message=error_message)))

def xmlhttprequest_vote_on_object(request, model, direction,
    object_id=None, slug=None, slug_field=None):
    """
    Generic object vote function for use via XMLHttpRequest.

    Properties of the resulting JSON object:
        success
            ``true`` if the vote was successfully processed, ``false``
            otherwise.
        score
            The object's updated score and number of votes if the vote
            was successfully processed.
        error_message
            Contains an error message if the vote was not successfully
            processed.
    """
    if request.method == 'GET':
        return json_error_response(
            'XMLHttpRequest votes can only be made using POST.')
    if not request.user.is_authenticated():
        return json_error_response('Not authenticated.')

    try:
        vote = dict(VOTE_DIRECTIONS)[direction]
    except KeyError:
        return json_error_response(
            '\'%s\' is not a valid vote type.' % direction)

    # Look up the object to be voted on
    lookup_kwargs = {}
    if object_id:
        lookup_kwargs['%s__exact' % model._meta.pk.name] = object_id
    elif slug and slug_field:
        lookup_kwargs['%s__exact' % slug_field] = slug
    else:
        return json_error_response('Generic XMLHttpRequest vote view must be '
                                   'called with either object_id or slug and '
                                   'slug_field.')
    try:
        obj = model._default_manager.get(**lookup_kwargs)
    except ObjectDoesNotExist:
        return json_error_response(
            'No %s found for %s.' % (model._meta.verbose_name, lookup_kwargs))

    # Vote
    if slug_field == 'comment' and UserProfile.objects.get(user=obj.user).is_college_staff is False:
        if vote == 1 or vote == 0:
            Vote.objects.record_vote(obj, request.user, vote)
    else:
        Vote.objects.record_vote(obj, request.user, vote)

    if slug_field == 'post':
        post_content_type = ContentType.objects.get(model='post')
        if Vote.objects.filter(object_id=obj.id,content_type_id=post_content_type.id):
            percent = int(round((len(Vote.objects.filter(vote='1',object_id=obj.id,content_type_id=post_content_type.id))/float(len(Vote.objects.filter(object_id=obj.id,content_type_id=post_content_type.id))))*100))
        else:
            percent = 0
        return HttpResponse(simplejson.dumps({
            'success': True,
            'score': Vote.objects.get_score(obj),
            'up': len(Vote.objects.filter(vote='1',object_id=obj.id, content_type_id=post_content_type.id)),
            'down': len(Vote.objects.filter(vote='-1',object_id=obj.id, content_type_id=post_content_type.id)),
            'percent': percent,
        }))
    if slug_field == 'comment':
        comment_content_type = ContentType.objects.get(model='comment')
        if Vote.objects.filter(object_id=obj.id,content_type_id=comment_content_type.id):
            percent = int(round((len(Vote.objects.filter(vote='1',object_id=obj.id,content_type_id=comment_content_type.id))/float(len(Vote.objects.filter(object_id=obj.id,content_type_id=comment_content_type.id))))*100))
        else:
            percent = 0
        return HttpResponse(simplejson.dumps({
            'success': True,
            'score': Vote.objects.get_score(obj),
            'up': len(Vote.objects.filter(vote='1',object_id=obj.id, content_type_id=comment_content_type.id)),
            'down': len(Vote.objects.filter(vote='-1',object_id=obj.id, content_type_id=comment_content_type.id)),
            'percent': percent,
        }))
