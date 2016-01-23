var resize_start = new Date();

$(window).resize(function()
{
	var currentTime = new Date();
	var current_window_width = $(window).width();
		
	if(currentTime - resize_start > 100)
	{
        if($('#feeds').hasClass('in') && current_window_width>767)
		{
			$('#feeds').removeClass('in');
			$('#feeds').addClass('collapse');
		}
	}
});