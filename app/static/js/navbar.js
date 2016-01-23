$(document).ready(function() 
{
	//Remove #'s from URLs on anchor clicks
	$("a#toggle-navbar-collapse").click(function(event){event.preventDefault();});
	$("ul.nav.nav-tabs li a").click(function(event){event.preventDefault();});
});

$(window).resize(function()
{
	var window_width = $(window).width();
	
	if($('#navbar-collapse').hasClass('in'))
	{
		if(window_width>767)
		{
			collapseNavbar();
		}
	}
});

function collapseNavbar()
{
	var pages 			= $('#pages-mobile'),
		user			= $('#user-mobile'),
		messages		= $('#messages-mobile'),
		notifications 	= $('#notifications-mobile'),
		settings		= $('#settings-mobile'),
		signin			= $('#signin-mobile');
		
		
	var pages_signedin_tab 			=  $('#nav-pages_signedin'),
		user_signedin_tab			=  $('#nav-user_signedin'),
		messages_signedin_tab		=  $('#nav-messages_signedin'),
		notifications_signedin_tab	=  $('#nav-notifications_signedin'),
		settings_signedin_tab		=  $('#nav-settings_signedin'),
		pages_signedout_tab 		=  $('#nav-pages_signedout'),
		signin_tab					=  $('#nav-signin');
	
	//If the navbar-collapse has not been opened...
	if($('#navbar-collapse').hasClass('collapse'))
	{
		$('.container.top').before("<div id='navbar-backdrop' style='background-color: rgba(255,255,255,.875); height: 100%; position: fixed; width: 100%; z-index: 3' onclick='collapseNavbar()'></div>"); 
		$('#navbar-collapse').collapse('show');
	}
	//If the navbar-collapse has not been closed...
	else if($('#navbar-collapse').hasClass('in'))
	{
		$('#navbar-backdrop').remove();
		$('#navbar-collapse').collapse('hide');
				
		//Collapse pages after the navbar is closed		
		$('#navbar-collapse').on('hidden.bs.collapse', function()
		{
			//Toggle any open pages & their tabs
			if(pages.hasClass('in'))
			{
				pages.removeClass('in').addClass('collapse');
				pages_signedin_tab.removeClass('active');
				pages_signedout_tab.removeClass('active');
			}	
			if(user.hasClass('in'))
			{	
				user.removeClass('in').addClass('collapse');
				user_signedin_tab.removeClass('active');
			}
			if(messages.hasClass('in'))
			{	
				messages.removeClass('in').addClass('collapse');
				messages_signedin_tab.removeClass('active');
			}
			if(notifications.hasClass('in'))
			{	
				notifications.removeClass('in').addClass('collapse');
				notifications_signedin_tab.removeClass('active');
			}
			if(settings.hasClass('in'))
			{	
				settings.removeClass('in').addClass('collapse');
				settings_signedin_tab.removeClass('active');
			}
			if(signin.hasClass('in'))
			{	
				signin.removeClass('in').addClass('collapse');
				signin_tab.removeClass('active');
			}			
			
		});
	}	
}

function openSection(section, login)
{
	var pages 			= $('#pages-mobile'),
		user			= $('#user-mobile'),
		messages		= $('#messages-mobile'),
		notifications 	= $('#notifications-mobile'),
		settings		= $('#settings-mobile'),
		signin			= $('#signin-mobile');
		
		
	var pages_signedin_tab 			=  $('#nav-pages_signedin'),
		user_signedin_tab			=  $('#nav-user_signedin'),
		messages_signedin_tab		=  $('#nav-messages_signedin'),
		notifications_signedin_tab	=  $('#nav-notifications_signedin'),
		settings_signedin_tab		=  $('#nav-settings_signedin'),
		pages_signedout_tab 		=  $('#nav-pages_signedout'),
		signin_tab					=  $('#nav-signin');
		
	
	//If none of the pages are in the middle of being opened or closed...
	if(!pages.hasClass('collapsing') && !signin.hasClass('collapsing') && !user.hasClass('collapsing'))
	{
		if(login=="signedin")
		{
			if(section=="pages")
			{
				if(pages.hasClass('in'))
				{
					pages.collapse('hide');
					pages_signedin_tab.removeClass('active');
				}
				else
				{
					if(user.hasClass('in'))
					{
						user.collapse('hide');
						user_signedin_tab.removeClass('active');
						user.on('hidden.bs.collapse', function(){pages_signedin_tab.addClass('active');	pages.addClass('active');	pages.collapse('show'); user.off()});
					}
					else if(messages.hasClass('in'))
					{
						messages.collapse('hide');
						messages_signedin_tab.removeClass('active');
						messages.on('hidden.bs.collapse', function(){pages_signedin_tab.addClass('active');	pages.addClass('active');	pages.collapse('show'); messages.off()});
					}
					else if(notifications.hasClass('in'))
					{
						notifications.collapse('hide');
						notifications_signedin_tab.removeClass('active');
						notifications.on('hidden.bs.collapse', function(){pages_signedin_tab.addClass('active');	pages.addClass('active');	pages.collapse('show'); notifications.off();});
					}
					else if(settings.hasClass('in'))
					{
						settings.collapse('hide');
						settings_signedin_tab.removeClass('active');
						settings.on('hidden.bs.collapse', function(){pages_signedin_tab.addClass('active');	pages.addClass('active');	pages.collapse('show'); settings.off();});
					}
					else
					{
						pages.collapse('show');
						pages_signedin_tab.addClass('active');
					}
				}	
			}
			else if(section=="user")
			{
				if(user.hasClass('in'))
				{
					user.collapse('hide');
					user_signedin_tab.removeClass('active');
				}
				else
				{
					if(pages.hasClass('in'))
					{
						pages.collapse('hide');
						pages_signedin_tab.removeClass('active');
						pages.on('hidden.bs.collapse', function(){user_signedin_tab.addClass('active');	user.addClass('active');	user.collapse('show'); pages.off();});
					}
					else if(messages.hasClass('in'))
					{
						messages.collapse('hide');
						messages_signedin_tab.removeClass('active');
						messages.on('hidden.bs.collapse', function(){user_signedin_tab.addClass('active');	user.addClass('active');	user.collapse('show'); messages.off();});
					}
					else if(notifications.hasClass('in'))
					{
						notifications.collapse('hide');
						notifications_signedin_tab.removeClass('active');
						notifications.on('hidden.bs.collapse', function(){user_signedin_tab.addClass('active');	user.addClass('active');	user.collapse('show'); notifications.off();});
					}
					else if(settings.hasClass('in'))
					{
						settings.collapse('hide');
						settings_signedin_tab.removeClass('active');
						settings.on('hidden.bs.collapse', function(){user_signedin_tab.addClass('active');	user.addClass('active');	user.collapse('show'); settings.off();});
					}
					else
					{
						user.collapse('show');
						user_signedin_tab.addClass('active');
					}
				}	
			}
			else if(section=="messages")
			{
				if(messages.hasClass('in'))
				{
					messages.collapse('hide');
					messages_signedin_tab.removeClass('active');
				}
				else
				{
					if(pages.hasClass('in'))
					{
						pages.collapse('hide');
						pages_signedin_tab.removeClass('active');
						pages.on('hidden.bs.collapse', function(){messages_signedin_tab.addClass('active');	messages.addClass('active');	messages.collapse('show'); pages.off();});
					}
					else if(user.hasClass('in'))
					{
						user.collapse('hide');
						user_signedin_tab.removeClass('active');
						user.on('hidden.bs.collapse', function(){messages_signedin_tab.addClass('active');	messages.addClass('active');	messages.collapse('show'); user.off();});
					}
					else if(notifications.hasClass('in'))
					{
						notifications.collapse('hide');
						notifications_signedin_tab.removeClass('active');
						notifications.on('hidden.bs.collapse', function(){messages_signedin_tab.addClass('active');	messages.addClass('active');	messages.collapse('show'); notifications.off();});
					}
					else if(settings.hasClass('in'))
					{
						settings.collapse('hide');
						settings_signedin_tab.removeClass('active');
						settings.on('hidden.bs.collapse', function(){messages_signedin_tab.addClass('active');	messages.addClass('active');	messages.collapse('show'); settings.off();});
					}
					else
					{
						messages.collapse('show');
						messages_signedin_tab.addClass('active');
					}
				}	
			}
			else if(section=="notifications")
			{
				if(notifications.hasClass('in'))
				{
					notifications.collapse('hide');
					notifications_signedin_tab.removeClass('active');
				}
				else
				{
					if(pages.hasClass('in'))
					{
						pages.collapse('hide');
						pages_signedin_tab.removeClass('active');
						pages.on('hidden.bs.collapse', function(){notifications_signedin_tab.addClass('active');	notifications.addClass('active');	notifications.collapse('show'); pages.off();});
					}
					else if(user.hasClass('in'))
					{
						user.collapse('hide');
						user_signedin_tab.removeClass('active');
						user.on('hidden.bs.collapse', function(){notifications_signedin_tab.addClass('active');	notifications.addClass('active');	notifications.collapse('show'); user.off();});
					}
					else if(messages.hasClass('in'))
					{
						messages.collapse('hide');
						messages_signedin_tab.removeClass('active');
						messages.on('hidden.bs.collapse', function(){notifications_signedin_tab.addClass('active');	notifications.addClass('active');	notifications.collapse('show'); messages.off();});
					}
					else if(settings.hasClass('in'))
					{
						settings.collapse('hide');
						settings_signedin_tab.removeClass('active');
						settings.on('hidden.bs.collapse', function(){notifications_signedin_tab.addClass('active');	notifications.addClass('active');	notifications.collapse('show'); settings.off();});
					}
					else
					{
						notifications.collapse('show');
						notifications_signedin_tab.addClass('active');
					}
				}	
			}
			else if(section=="settings")
			{
				if(settings.hasClass('in'))
				{
					settings.collapse('hide');
					settings_signedin_tab.removeClass('active');
				}
				else
				{
					if(pages.hasClass('in'))
					{
						pages.collapse('hide');
						pages_signedin_tab.removeClass('active');
						pages.on('hidden.bs.collapse', function(){settings_signedin_tab.addClass('active');	settings.addClass('active');	settings.collapse('show'); pages.off();});
					}
					else if(user.hasClass('in'))
					{
						user.collapse('hide');
						user_signedin_tab.removeClass('active');
						user.on('hidden.bs.collapse', function(){settings_signedin_tab.addClass('active');	settings.addClass('active');	settings.collapse('show'); user.off();});
					}
					else if(messages.hasClass('in'))
					{
						messages.collapse('hide');
						messages_signedin_tab.removeClass('active');
						messages.on('hidden.bs.collapse', function(){settings_signedin_tab.addClass('active');	settings.addClass('active');	settings.collapse('show'); messages.off();});
					}
					else if(notifications.hasClass('in'))
					{
						notifications.collapse('hide');
						notifications_signedin_tab.removeClass('active');
						notifications.on('hidden.bs.collapse', function(){settings_signedin_tab.addClass('active');	settings.addClass('active');	settings.collapse('show'); notifications.off();});
					}
					else
					{
						settings.collapse('show');
						settings_signedin_tab.addClass('active');
					}
				}	
			}
		}
		else if(login=="signedout")
		{
			if(section=="pages")
			{
				if(signin.hasClass('in'))
				{
					signin_tab.removeClass('active');
					signin.collapse('hide');
					
					signin.on('hidden.bs.collapse', function()
					{
						pages_signedout_tab.addClass('active');
						pages.collapse('show');	
					});
				}
				else if(signin.hasClass('collapse'))
				{
					pages_signedout_tab.addClass('active');
					pages.collapse('show');	
				}
			}
			else if(section=="signin")
			{
				if(pages.hasClass('in'))
				{
					pages_signedout_tab.removeClass('active');
					pages.collapse('hide');
					
					pages.on('hidden.bs.collapse', function()
					{
						signin_tab.addClass('active');
						signin.collapse('show');	
					});
				}
				else if(pages.hasClass('collapse'))
				{
					signin_tab.addClass('active');
					signin.collapse('show');	
				}
			}
		}
	}
}