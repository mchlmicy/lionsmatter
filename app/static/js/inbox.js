$(document).ready(function() 
{
	//Handles linking to message from inbox
	$('#messagesTable>tbody>tr td.sender').click(function(){window.location = $(this).closest('tr').attr('data-link');});
	$('#messagesTable>tbody>tr td.message').click(function(){window.location = $(this).closest('tr').attr('data-link');});
	$('#messagesTable>tbody>tr td.date').click(function(){window.location = $(this).closest('tr').attr('data-link');});
	
	$('a#markmessage_desktop').click(function(event)
	{	
		event.preventDefault();
		
		if(!$(this).parent().hasClass('disabled'))
		{  
			batchUpdate('read');
		}
	});
	$('a#deletemessage_desktop').click(function(event)
	{
		event.preventDefault(); 
		
		if(!$(this).parent().hasClass('disabled'))
		{
			batchUpdate('delete');
		}
	});
});

function batchUpdate(type)
{
	var input = $("<input>").attr("type", "hidden").attr("name", "action").val(type);
    $('#batchUpdate').append($(input)).submit();
}

function checkCheckboxes()
{
	if($('#messagesTable input:checkbox:checked').length == 0)
    {
  		$('#messageoptions_desktoptablet li').addClass('disabled');
        $('#messageoptions_mobile').html("<span class='text-muted disabled'>mark as read</span><span class='text-muted'> &bull; </span><span class='text-muted disabled'>delete</span>");
    }
    else
	{
      	$('#messageoptions_desktoptablet li').removeClass('disabled');
        $('#messageoptions_mobile').html("<a href='#' id='markmessage_mobile' type='submit' name='action' value='read'>mark as read</a><span class='text-muted'> &bull; </span><a href='#' id='deletemessage_mobile' type='submit' name='action' value='delete'>delete</a>");
		$('a#markmessage_mobile').click(function(event){event.preventDefault(); batchUpdate('read');});
		$('a#deletemessage_mobile').click(function(event){event.preventDefault(); batchUpdate('delete');});
	}
}