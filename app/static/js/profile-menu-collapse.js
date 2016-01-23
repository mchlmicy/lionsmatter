var initial_window_width = $(window).width();
var resize_start = new Date();

$(window).resize(function()
{
	var currentTime = new Date();
	var current_window_width = $(window).width();
		
	if(currentTime - resize_start > 100)
	{
		if(initial_window_width>767)
		{
			if(current_window_width<767)
			{
				if($('#actionoptions').hasClass('in'))
				{
					$('#actionoptions').removeClass('in');
					$('#actionoptions').addClass('collapse');
				}
				if($('#historyfeeds').hasClass('in'))
				{
					$('#historyfeeds').removeClass('in');
					$('#historyfeeds').addClass('collapse');
				}
				
				initial_window_width = current_window_width;
			}
		}
		if(initial_window_width<767)
		{
			if(current_window_width>767)
			{
				if($('#actionoptions').hasClass('collapse'))
				{
					$('#actionoptions').collapse('show');
				}
				if($('#historyfeeds').hasClass('collapse'))
				{
					$('#historyfeeds').collapse('show');
				}
				
				initial_window_width = current_window_width;
			}
		}
	}
});