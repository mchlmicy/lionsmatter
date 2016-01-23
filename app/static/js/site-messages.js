function siteMessage(direction)
{	
	var current_message_indicator	= $('#site-messages-currentslide'),
	 	current_message_num 		= parseInt(current_message_indicator.html()),
	 	total_messages_num 			= parseInt($('#site-messages-total').html()),
		current_message 			= $('#site-message-' + current_message_num);
	 	
	
	// Figure out the next slide's number
	if(direction=='next')
	{
		if(current_message_num + 1 <= total_messages_num)
		{
			var next_message_num = current_message_num + 1;
		}
		else 
		{
			var next_message_num = 1;
		}
	}
	else if(direction=='previous')
	{
		if(current_message_num - 1 >= 1)
		{
			var next_message_num = current_message_num - 1;
		}
		else
		{
			var next_message_num = total_messages_num;
		}
	}
	
	// Define the next message as a html element
	var next_message = $('#site-message-' + next_message_num);
	
	// Switch out the messages
	current_message.css('display', 'none');
	next_message.css('display', 'inherit');
	
	// Update the current message indicator
	current_message_indicator.html(next_message_num);
}