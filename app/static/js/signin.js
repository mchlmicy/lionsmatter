$(document).ready(function() 
{
	//Remove #'s from URLs on anchor clicks
	$("a#signInPopover").click(function(event){event.preventDefault();});
});

$(function() 
{
    $('[data-toggle="popover"]').popover(
	{
        trigger: 'click',
        placement: 'bottom',
        html: true,
        container: 'body',
        content: function() 
		{
         	return $('#signin_options').html();
        }
	});

	$(document).on( 'scroll', function(e)
	{
		$('[data-toggle="popover"]').each(function () 
		{
        	//the 'is' for buttons that triggers popups
        	//the 'has' for icons within a button that triggers a popup
        	if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) 
			{
            	$(this).popover('hide');
				$('a#signInPopover').unbind('mouseenter mouseleave');
        	}
    	});
	});

	$('body').on('click', function (e) 
	{
    	$('[data-toggle="popover"]').each(function () 
		{
        	//the 'is' for buttons that triggers popups
        	//the 'has' for icons within a button that triggers a popup
        	if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) 
			{
            	$(this).popover('hide');
        	}
    	});
	});
});

function signinValidate(form){
    if(form=='mobile'){
        var frm = $("#signinFormMobile");
    }
    else{
        var frm = $("#signinForm");
    }
        $.ajax({ // create an AJAX call...
            data: frm.serialize(), // get the form data
            type: frm.attr('method'), // GET or POST
            url: frm.attr('action'), // the file to call
            success: function(data){
                var IS_JSON = true;
                try
                {
                   var json = $.parseJSON(data);
                   if(form=='mobile'){
                        $('#signinErrorsMobile').html('<div class="alert alert-warning"><strong>Oops!</strong> '+json+'</div>');
                   }
                   else{
                        $('#signinErrors').html('<div class="alert alert-warning"><strong>Oops!</strong> '+json+'</div>');
                   }
                   }
                catch(err)
                {
                   IS_JSON = false;
                   location.reload();
                }
            }
        });
        return false;
}
