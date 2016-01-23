/* Event Listeners */
function listen_postActions()
{
    $('a.alt-time').on('click', function(event){event.preventDefault();});
    $('a.post-option').on('click', function(event){event.preventDefault();});
    $('a.post-option-tab').on('click', function(event){event.preventDefault();});
}
$(document).ready(function(){listen_postActions();});

/* Post - Options */
function postOption(name, id, label)
{
    if(name == 'like-comment')
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
            $.post('/comments/vote/'+id+'/downvote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},function(data){$('#comment-' + id + '-downvotes').html(data.score);}, 'json');
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

function postOptionTab(tab, panel_name, tab_container)
{	
	var panel_container = $('#post-panel');

    if(!tab.hasClass('active'))
    {
        tab_container.find('a').each(function(){if($(this).hasClass('active')){$(this).removeClass('active');}});
        panel_container.find('.panel').each(function(){if($(this).css('display','inherit')){$(this).css('display','none');}});

        tab.addClass('active');
        panel_container.find('.panel').each(function(){if($(this).data('panel')==panel_name){$(this).css('display','inherit');}});
    }
}
function showAltTimestamp(timestamp)
{
    var alt_time = timestamp.data('alttime');
    timestamp.data('alttime', timestamp.html());
    timestamp.html(alt_time);
}