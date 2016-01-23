/* Event Listeners */
function listen_postActions()
{
    $('a.alt-time').on('click', function(event){event.preventDefault();});
    $('a.sort-box').on('click', function(event){event.preventDefault();});
    $('a.post-option').on('click', function(event){event.preventDefault();});
}
$(document).ready(function(){listen_postActions();});

function expandSortBox(sortbox)
{
    sortbox.find('.sort-data').each(function()
    {
        if(sortbox.hasClass($(this).data('name')))
        {
            sortbox.removeClass($(this).data('name'));
            $(this).css('display', 'none');
        }
        else
        {
            sortbox.addClass($(this).data('name'));
            $(this).css('display', 'inherit');
        }
    });
}

function postOption(name, id, label)
{
    if(name == 'expand')
    {
        if(label.data('expanded') == false)
        {
            $('#post-'+id).addClass('expanded');
            label.html('<span class="glyphicon glyphicon-minus" style="vertical-align: middle"></span>');
            label.data('expanded', true);
        }
        else
        {
            $('#post-'+id).removeClass('expanded');
            label.html('<span class="glyphicon glyphicon-plus" style="vertical-align: middle"></span>');
            label.data('expanded', false);
        }
    }
    if(name == 'expand-comment')
    {
        if(label.data('expanded') == false)
        {
            $('#post-'+id+' .post-comment .lead-content').addClass('expanded');
            label.html('Collapse');
            label.data('expanded', true);
        }
        else
        {
            $('#post-'+id+' .post-comment .lead-content').removeClass('expanded');
            label.html('Expand');
            label.data('expanded', false);
        }
    }
    else if(name == 'toggle-comment')
    {
        console.log(id);

        var post = $('#post-'+id),
            collapse_section = post.find('.post-body');

        console.log(post);

        if(!collapse_section.hasClass('collapsing'))
        {
            if(label.data('toggled') == 'off')
            {
                post.addClass('opened');
                label.data('toggled', 'on');
                collapse_section.collapse('show');
            }
            else
            {
                post.addClass('closing');
                label.data('toggled', 'off');
                collapse_section.collapse('hide');
                collapse_section.one('hidden.bs.collapse', function(){post.removeClass('closing').removeClass('opened');});
            }
        }
    }
    else if(name == 'details')
    {
        if(!label.hasClass('disabled'))
        {
            var postDetailWrapper = $('#post-'+id+' .footer-content .button-row');

            if(label.data('expanded') == false)
            {
                postDetailWrapper.find('.tertiary-container').css('display','none');
                postDetailWrapper.find('.secondary-container').css('display','inline-block');
                label.html('Details:').data('expanded', true);
            }
            else
            {
                postDetailWrapper.find('.secondary-container').css('display','none');
                postDetailWrapper.find('.tertiary-container').css('display','inline-block');
                label.html('Details').data('expanded', false);
            }
        }
    }
    else if(name == 'comments')
    {
        var post = $('#post-'+id);

        if(label.data('expanded') == false)
        {
            post.find('.primary-container .footer-btn').addClass('disabled');
            post.addClass('opened');
            label.data('expanded', true);

            post.find('.comments-collapse').collapse('show');
        }
        else
        {
            post.find('.primary-container .footer-btn').removeClass('disabled');
            post.removeClass('opened');
            label.data('expanded', false);

            post.find('.comments-collapse').collapse('hide');
        }
    }
    else if(name == 'follow')
    {
        if(label.data('following') == false)
        {
            label.html('Unfollow');
            label.data('following', true);
            $.post('/post/'+id+'/follow/', {HTTP_X_REQUESTED:'XMLHttpRequest'});
        }
        else if(label.data('following') == true)
        {
            label.html('Follow');
            label.data('following', false);
            $.post('/post/'+id+'/unfollow/', {HTTP_X_REQUESTED:'XMLHttpRequest'});
        }
    }
    else if(name == 'like-comment')
    {
        if(label.data('liked') == false)
        {
            label.html('Undo:');
            label.parent().find('.helper-text').each(function(){$(this).css('display', 'inline-block')});
            $.post('/comments/vote/'+id+'/upvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-upvotes').html(data.score);}, 'json');

            label.data('liked', true);
        }
        else
        {
            label.html('Agree:');
            label.parent().find('.helper-text').each(function(){$(this).css('display', 'none')});
            $.post('/comments/vote/'+id+'/clearvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-upvotes').html(data.score);}, 'json');

            label.data('liked', false);
        }
    }
    else if(name == 'vote-department')
    {
        var wrapper = label.closest('.department-response-rating');
        var data = [parseInt(wrapper.find('.rating-display .rating-helpful').html()), parseInt(wrapper.find('.rating-display .rating-total').html())];

        if(label.data('votedir')=='up')
        {
            data[0]++; data[1]++;
            wrapper.find('.rating-input').html('<a href="#" onclick="postOption(\'vote-department\', '+ id +', $(this))" data-votedir="clear">Undo:</a> You found this helpful.').data('voted', 'up');
            $.post('/comments/vote/'+id+'/upvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-upvotes').html(data.score);}, 'json');
        }
        else if(label.data('votedir')=='down')
        {
            if(data[0]>0){data[0]--;} data[1]++;
            wrapper.find('.rating-input').html('<a href="#" onclick="postOption(\'vote-department\', '+ id +', $(this))" data-votedir="clear">Undo:</a> You found this unhelpful.').data('voted', 'down');
            $.post('/comments/vote/'+id+'/downvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-upvotes').html(data.score);}, 'json');
        }
        else if(label.data('votedir')=='clear')
        {
            if(wrapper.find('.rating-input').data('voted') == 'up'){data[0]--;}
            data[1]--;

            wrapper.find('.rating-input').html('Was this helpful? <a href="#" data-votedir="up" onclick="postOption(\'vote-department\', '+ id +', $(this))">Yes</a> / <a href="#" data-votedir="down" onclick="postOption(\'vote-department\', '+ id +', $(this))">No</a>');
            $.post('/comments/vote/'+id+'/clearvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-upvotes').html(data.score);}, 'json');
        }

        wrapper.find('.rating-display .rating-helpful').html(data[0]);
        wrapper.find('.rating-display .rating-total').html(data[1]);
    }
}

function showAltTimestamp(timestamp)
{
    var alt_time = timestamp.data('alttime');
    timestamp.data('alttime', timestamp.html());
    timestamp.html(alt_time);
}