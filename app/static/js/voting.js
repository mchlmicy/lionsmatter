function vote(id, direction) {
    $.post('/post/'+id+'/'+direction+'vote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},
           function(data) {
               if (data.success == true) {
                   $('#votes-'+id).text(data.score.score);
                   $('#num_votes').text(data.score.num_votes);
                   if(data.score.score > 0){
                        $("#votebox-"+id).attr('class', 'vote positive');
                    }
                   else if(data.score.score < 0){
                        $("#votebox-"+id).attr('class', 'vote negative');
                    }
                   else{
                        $("#votebox-"+id).attr('class', 'vote neutral');
                    }
                   if(direction == 'up'){
                       $("#votebox-"+id+" .arrow-up").addClass('voted');
                       $("#votebox-"+id+" .arrow-down").removeClass('voted');
                   }
                   else if (direction == 'down'){
                       $("#votebox-"+id+" .arrow-up").removeClass('voted');
                       $("#votebox-"+id+" .arrow-down").addClass('voted');
                   }

               } else {
                       $('#votebox-'+id).tooltip({
                           placement: 'auto',
                           container: 'body',
                           delay: { show: 0, hide: 100 },
                           title: 'You must be signed in to vote.'
                        });
                        $('#votebox-'+id).tooltip('show');
                        setTimeout(function() {
                            $('#votebox-'+id).tooltip('destroy');
                        }, 5000);
               }
           }, 'json'
          )
}

function responseVote(id, direction) {
    $.post('/comments/vote/'+id+'/'+direction+'vote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},
           function(data) {
               if (data.success == true) {
                   $('#responsevotes-'+id).text(data.score.score);
                   $('#num_votes').text(data.score.num_votes);
                   if(data.score.score > 0){
                        $("#responsevotebox-"+id).attr('class', 'vote positive');
                    }
                   else if(data.score.score < 0){
                        $("#responsevotebox-"+id).attr('class', 'vote negative');
                    }
                   else{
                        $("#responsevotebox-"+id).attr('class', 'vote neutral');
                    }
                   if(direction == 'up'){
                       $("#responsevotebox-"+id+" .arrow-up").addClass('voted');
                       $("#responsevotebox-"+id+" .arrow-down").removeClass('voted');
                   }
                   else if (direction == 'down'){
                       $("#responsevotebox-"+id+" .arrow-up").removeClass('voted');
                       $("#responsevotebox-"+id+" .arrow-down").addClass('voted');
                   }

               } else {
                       $('#responsevotebox-'+id).tooltip({
                           placement: 'auto',
                           container: 'body',
                           delay: { show: 0, hide: 100 },
                           title: 'You must be signed in to vote.'
                        });
                        $('#responsevotebox-'+id).tooltip('show');
                        setTimeout(function() {
                            $('#responsevotebox-'+id).tooltip('destroy');
                        }, 5000);
               }
           }, 'json'
          )
}


function commentVote(id, direction) 
{
    $.post('/comments/vote/'+id+'/'+direction+'vote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},
   	function(data) 
	{
		if(direction == 'up')
		{
			$('a#comment-' + id + '-vote-up').css('font-weight','bold');	
		}
		else if(direction == 'down')
		{
			$('a#comment-' + id + '-vote-down').css('font-weight','bold');
		}
				
		$('#comment-' + id + '-upvotes').html(data.up);
		$('#comment-' + id + '-downvotes').html(data.down);
	}, 'json'
	)
}

function postVote(id, direction) {
    $.post('/post/'+id+'/'+direction+'vote/', {HTTP_X_REQUESTED:'XMLHttpRequest'},
           function(data) {
               if (data.success == true) {
                   $('#postVotePercent').text(data.percent+'%');
                   $('#postVoteUpTotal').text(data.up);
                   $('#postVoteUpTotalM').text(data.up);
                   $('#postVoteDownTotal').text(data.down);
                   $('#postVoteDownTotalM').text(data.down);

                   if(direction == 'up'){
                       $("#postVoteUp").addClass('active');
                       $("#postVoteDown").removeClass('active');
                       $("#postVoteUpM").addClass('active');
                       $("#postVoteDownM").removeClass('active');
                   }
                   else if (direction == 'down'){
                       $("#postVoteUp").removeClass('active');
                       $("#postVoteDown").addClass('active');
                       $("#postVoteUpM").removeClass('active');
                       $("#postVoteDownM").addClass('active');
                   }

               } else {
                       $('#votebox-'+id).tooltip({
                           placement: 'auto',
                           container: 'body',
                           delay: { show: 0, hide: 100 },
                           title: 'You must be signed in to vote.'
                        });
                        $('#votebox-'+id).tooltip('show');
                        setTimeout(function() {
                            $('#votebox-'+id).tooltip('destroy');
                        }, 5000);
               }
           }, 'json'
          )
}