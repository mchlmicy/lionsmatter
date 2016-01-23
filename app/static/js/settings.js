// EDIT BUTTONS 
// The individual edit buttons are not displayed by default.
// As such they must be toggled by master edit buttons on
// a per settings section basis.
// Master edit buttons, defined
var showEditGeneral		 	= $('a#showEditGeneral'),
	showEditAbout 			= $('a#showEditAbout'),
	showEditNotification 	= $('a#showEditNotification'),
	showEditPrivacy 		= $('a#showEditPrivacy');
	
//Individual edit buttons, defined
var generalSettingsEditButtons		= $('#general-settings .setting .edit a'),
	aboutSettingsEditButtons 		= $('#about-settings .setting .edit a'),
	notificationSettingsEditButtons = $('#notification-settings .setting .edit a'),
	privacySettingsEditButtons 		= $('#privacy-settings .setting .edit a'),
	allSettingsEditButtons 			= $('.setting .edit a');/*All edit settings buttons*/


// SETTINGS SECTIONS AND TOGGLES
// Each settings section is switched out, and as such each
// must be defined. The settings sections are switched out 
// by options and tabs which function similarly but are 
// displayed differently. Options are visible on tablets 
// and desktops and tabs are visible on mobile devices.
// Settings sections
var	general		= $('#general-settings'),
	about		= $('#about-settings'),
	notification= $('#notification-settings'),
	privacy		= $('#privacy-settings');

// Settings section options
var	general_opt		= $('#option-general'),
	about_opt		= $('#option-about'),
	notification_opt= $('#option-notification'),
	privacy_opt		= $('#option-privacy');
	
// Settings section tabs
var general_tab		= $('#tab-general'),
	about_tab		= $('#tab-about'),
	notification_tab= $('#tab-notification'),
	privacy_tab		= $('#tab-privacy');
	
// Individual settings
var setting_name 				= $('#setting-name'), 
	setting_email 				= $('#setting-email'), 
	setting_password			= $('#setting-password'), 
	setting_classyr 			= $('#setting-class_yr'), 
	setting_major 				= $('#setting-major'),
	setting_receivenotification = $('#setting-receive_notifications'), 
	setting_notificationemail 	= $('#setting-notification_email'), 
	setting_displayname 		= $('#setting-display_name'); 
 
 
$(document).ready(function() 
{
	// Initializes the functionality of master edit buttons for each
	// section and prevents '#'s from being put into the url on click.
	showEditGeneral.bind('click.showEditButtons', function(event)		{event.preventDefault(); 	showEditOption('general', 'show');});
	showEditAbout.bind('click.showEditButtons', function(event)			{event.preventDefault();	showEditOption('about', 'show');});
	showEditNotification.bind('click.showEditButtons', function(event)	{event.preventDefault();	showEditOption('notification', 'show');});
	showEditPrivacy.bind('click.showEditButtons', function(event)		{event.preventDefault();	showEditOption('privacy', 'show');});
	
	/*Remove #'s from URLs on anchor clicks*/
	//Individual edit settings buttons
	allSettingsEditButtons.click(function(event){event.preventDefault();});
	
	// Prevent '#'s from being put into the url on 
	// clicking either settings section options or tabs.
	general_opt.click(function(event){event.preventDefault();});	about_opt.click(function(event){event.preventDefault();});	notification_opt.click(function(event){event.preventDefault();});	privacy_opt.click(function(event){event.preventDefault();});
	general_tab.click(function(event){event.preventDefault();});	about_tab.click(function(event){event.preventDefault();});	notification_tab.click(function(event){event.preventDefault();});	privacy_tab.click(function(event){event.preventDefault();});
	
});

// Hides/shows individual edit buttons
function showEditOption(option, state)
{
	if(state=="show")
	{
		// PROCESS: Showing the edit buttons in a section      
		// - Get all of the edit buttons in that section         
		// - Display all of those edit buttons                 
		// - Set the text of the master edit button of that section to 'Cancel' 
		// - Unbind the old showEditButtons() for that button 
		// - Bind the new hideEditButtons() function to the same button     
		if(option=="general")			{generalSettingsEditButtons		= $('#general-settings .setting .edit a'); 		generalSettingsEditButtons.css('display', 'inherit');		showEditGeneral.html('Cancel');			showEditGeneral.unbind('click.showEditButtons');		showEditGeneral.bind('click.hideEditButtons', 		function(event){event.preventDefault();	showEditOption('general', 'hide');});}
		else if(option=="about")		{aboutSettingsEditButtons		= $('#about-settings .setting .edit a'); 		aboutSettingsEditButtons.css('display', 'inherit');			showEditAbout.html('Cancel');			showEditAbout.unbind('click.showEditButtons');			showEditAbout.bind('click.hideEditButtons',   		function(event){event.preventDefault();	showEditOption('about', 'hide');});}
		else if(option=="notification")	{notificationSettingsEditButtons= $('#notification-settings .setting .edit a'); notificationSettingsEditButtons.css('display', 'inherit');	showEditNotification.html('Cancel');	showEditNotification.unbind('click.showEditButtons');	showEditNotification.bind('click.hideEditButtons', 	function(event){event.preventDefault();	showEditOption('notification', 'hide');});}
		else if(option=="privacy")		{privacySettingsEditButtons		= $('#privacy-settings .setting .edit a');		privacySettingsEditButtons.css('display', 'inherit');		showEditPrivacy.html('Cancel');			showEditPrivacy.unbind('click.showEditButtons');		showEditPrivacy.bind('click.hideEditButtons', 		function(event){event.preventDefault();	showEditOption('privacy', 'hide');});}
		
	}
	else if(state=="hide")
	{
		// The cancel buttons for every setting
		var setting_name_cancel = $('#setting-name .cancel'), setting_email_cancel = $('#setting-email .cancel'), setting_password_cancel = $('#setting-password .cancel'), 
			setting_classyr_cancel = $('#setting-class_yr .cancel'), setting_major_cancel = $('#setting-major .cancel'), 
			setting_receivenotification_cancel = $('#setting-receive_notifications .cancel'), setting_notificationemail_cancel = $('#setting-notification_email .cancel'), 
			setting_displayname_cancel = $('#setting-display_name .cancel'); 
		
		// PROCESS: Hiding the edit buttons in a section 
		// - Check if any of the settings in that section are being edited; close them     
		// - Get all of the edit buttons in that section         
		// - Hide all of those edit buttons                 
		// - Set the text of the master edit button of that section to 'Edit' 
		// - Unbind the old hideEditButtons() for that button 
		// - Bind the new showEditButtons() function to the same button 
		if(option=="general")			
		{	
			if(setting_name.hasClass('editing'))	{setting_name_cancel.click();}
			if(setting_email.hasClass('editing'))	{setting_email_cancel.click();}
			if(setting_password.hasClass('editing')){setting_password_cancel.click();}
			
			generalSettingsEditButtons = $('#general-settings .setting .edit a'); 		
			generalSettingsEditButtons.css('display', 'none');			
			
			showEditGeneral.html('Edit');		
			
			showEditGeneral.unbind('click.hideEditButtons');		
			showEditGeneral.bind('click.showEditButtons', function(event){event.preventDefault(); showEditOption('general', 'show');});
		}
		else if(option=="about")		
		{
			if(setting_classyr.hasClass('editing'))	{setting_classyr_cancel.click();}
			if(setting_major.hasClass('editing'))	{setting_major_cancel.click();}
		
			aboutSettingsEditButtons = $('#about-settings .setting .edit a'); 		
			aboutSettingsEditButtons.css('display', 'none');			
			
			showEditAbout.html('Edit');			
			
			showEditAbout.unbind('click.hideEditButtons');			
			showEditAbout.bind('click.showEditButtons', function(event){event.preventDefault();	showEditOption('about', 'show');});
		}
		else if(option=="notification")	
		{
			if(setting_receivenotification.hasClass('editing'))	{setting_receivenotification_cancel.click();}
			if(setting_notificationemail.hasClass('editing'))	{setting_notificationemail_cancel.click();}
		
			notificationSettingsEditButtons = $('#notification-settings .setting .edit a'); 
			notificationSettingsEditButtons.css('display', 'none');		
			
			showEditNotification.html('Edit');	
			
			showEditNotification.unbind('click.hideEditButtons');	
			showEditNotification.bind('click.showEditButtons', function(event){event.preventDefault(); showEditOption('notification', 'show');});
		}
		else if(option=="privacy")		
		{
			if(setting_displayname.hasClass('editing'))	{setting_displayname_cancel.click();}
			
			privacySettingsEditButtons = $('#privacy-settings .setting .edit a');		
			privacySettingsEditButtons.css('display', 'none');			
			
			showEditPrivacy.html('Edit');		
			
			showEditPrivacy.unbind('click.hideEditButtons');		
			showEditPrivacy.bind('click.showEditButtons', function(event){event.preventDefault(); showEditOption('privacy', 'show');});
		}
	}
}

// Handles switching of settings sections
function settingsOption(option)
{	
	var last, last_opt, last_tab;
	var setting_name_cancel = $('#setting-name .cancel'), setting_email_cancel = $('#setting-email .cancel'), setting_password_cancel = $('#setting-password .cancel'), 
		setting_classyr_cancel = $('#setting-class_yr .cancel'), setting_major_cancel = $('#setting-major .cancel'), 
		setting_receivenotification_cancel = $('#setting-receive_notifications .cancel'), setting_notificationemail_cancel = $('#setting-notification_email .cancel'), 
		setting_displayname_cancel = $('#setting-display_name .cancel'); 
		
	// PROCESS: 
	// - Find the settings section that is currently open
	// - In that settings section close any settings still being edited
	// - Save the locations of that section, its options and its tabs.
	if(general_opt.hasClass('active'))			
	{
		if(setting_name.hasClass('editing'))	{setting_name_cancel.click();}
		if(setting_email.hasClass('editing'))	{setting_email_cancel.click();}
		if(setting_password.hasClass('editing')){setting_password_cancel.click();}
		
		last = general; 
		last_opt = general_opt; 
		last_tab = general_tab;
	}
	else if(about_opt.hasClass('active'))		
	{
		if(setting_classyr.hasClass('editing'))	{setting_classyr_cancel.click();}
		if(setting_major.hasClass('editing'))	{setting_major_cancel.click();}
		
		last = about; 
		last_opt = about_opt; 
		last_tab = about_tab;
	}
	else if(notification_opt.hasClass('active'))
	{
		if(setting_receivenotification.hasClass('editing'))	{setting_receivenotification_cancel.click();}
		if(setting_notificationemail.hasClass('editing'))	{setting_notificationemail_cancel.click();}
		
		last = notification; 
		last_opt = notification_opt; 
		last_tab = notification_tab;
	}
	else if(privacy_opt.hasClass('active'))		
	{
		if(setting_displayname.hasClass('editing'))	{setting_displayname_cancel.click();}
		
		last = privacy; 
		last_opt = privacy_opt; 
		last_tab = privacy_tab;
	}
	
	// PROCESS: Switching out settings sections      
	// - Get the option passed to the functions and figure out which settings section was selected        
	// - Continue only if that section isn't already displayed              
	// - Unhighlight the old selected tab and highlight the new selected tab
	// - Unhighlight the old selected option and highlight the new selected option
	// - Hide any visible individual edit buttons in the new selected settings section
	// - Hide the old selected settings section and show the new selected settings section
	if(option=="general")
	{
		if(!general_opt.hasClass('active'))
		{
			last_opt.removeClass('active');				general_opt.addClass('active');				
			last_tab.parent().removeClass('active');	general_tab.parent().addClass('active');	
			
			showEditOption('general', 'hide');
			
			last.css('visibility', 'hidden');	general.css('visibility', 'visible');
		}
	}
	else if(option=="about")
	{
		if(!about_opt.hasClass('active'))
		{
			last_opt.removeClass('active');				about_opt.addClass('active');			
			last_tab.parent().removeClass('active');	about_tab.parent().addClass('active');
			
			showEditOption('about', 'hide');
			
			last.css('visibility', 'hidden');	about.css('visibility', 'visible');
		}
	}
	else if(option=="notification")
	{
		if(!notification_opt.hasClass('active'))
		{
			last_opt.removeClass('active');				notification_opt.addClass('active');			
			last_tab.parent().removeClass('active');	notification_tab.parent().addClass('active');	
			
			showEditOption('notification', 'hide');
			
			last.css('visibility', 'hidden');	notification.css('visibility', 'visible');
		}
	}
	else if(option=="privacy")
	{
		if(!privacy_opt.hasClass('active'))
		{
			last_opt.removeClass('active');				privacy_opt.addClass('active');				
			last_tab.parent().removeClass('active');	privacy_tab.parent().addClass('active');	
			
			showEditOption('privacy', 'hide');
			
			last.css('visibility', 'hidden');	privacy.css('visibility', 'visible');
		}
	}
}

// Uses parameters to build edit settings forms
function editSetting(title, name, input, value, full_name, username)
{
	// All of the individual settings that can be edited
	var setting;
		     if(name=="full_name")				{setting = $('#setting-name');}
		else if(name=="email")					{setting = $('#setting-email');}
		else if(name=="password")				{setting = $('#setting-password');}
		else if(name=="class_yr")				{setting = $('#setting-class_yr');}
		else if(name=="major")					{setting = $('#setting-major');}
		else if(name=="receive_notifications")	{setting = $('#setting-receive_notifications');}
		else if(name=="notification_email")		{setting = $('#setting-notification_email');}
		else if(name=="display_name")			{setting = $('#setting-display_name');}

	if(input=="text")
	{
        if(name=="class_yr")
		{
            setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
							<td class='col-md-8 value'> \
								<form method='POST' action='/settings/' id='" + name + "-form'> \
									<input type='number' min='1925' max='2017' class='form-control input-sm' id='id_" + name + "' name='" + name + "' value='" + value + "'/> \
								</td> \
								<td class='col-md-1 edit'> \
									<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
									<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "');\"> \
								</td> \
							</form> \
						").addClass('editing');

        }
        else
		{
			setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
								<td class='col-md-8 value'> \
								<form method='POST' action='/settings/' id='" + name + "-form'> \
									<input class='form-control input-sm' id='id_" + name + "' name='" + name + "' value='" + value + "'/> \
								</td> \
								<td class='col-md-1 edit'> \
									<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
									<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "');\"> \
								</td> \
							</form> \
						").addClass('editing');
        }
	}
	else if(input=="texts")
	{
		if(name=="password")
		{
			setting.html("	    <td class='col-md-3'><h5>" + title + "</h5></td> \
								<td class='col-md-8 value'> \
							    <form method='POST' action='/settings/' id='" + name + "-form'> \
									<input type='password' class='form-control input-sm' name='password_old' placeholder='Old Password' style='margin-bottom: 15px'/> \
									<input type='password' class='form-control input-sm' name='password_new' placeholder='New Password'/> \
								</td> \
								<td class='col-md-1 edit' style='vertical-align: top'> \
									<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name  + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
									<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "');\"> \
								</td> \
							</form> \
						").addClass('editing');
		}
	}
	else if(input=="dropdown-postname")
	{
		setting.html(" <td class='col-md-3'><h5>" + title + "</h5></td> \
							<td class='col-md-8 value'> \
                                <form method='POST' action='/settings/' id='" + name + "-form'> \
 									<select class='selectpicker' data-width='100px' name='" + name + "' id='id_" + name + "'> \
                                        <option value='" + username + "'>" + username + "</option> \
                                        <option value='" + full_name + "'>" + full_name + "</option> \
                                        <option value='anonymous'>anonymous</option> \
                                    </select> \
							</td> \
							<td class='col-md-1 edit' style='vertical-align: top'> \
								<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "','" + username + "','" + full_name + "')\" type='button' value='Cancel'/> \
								<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "','" + username + "','" + full_name + "');\"> \
							</td> \
						</form> \
						<script>$(document).ready(function() {$('.selectpicker').selectpicker(); });</script> \
					").addClass('editing');
        var label = $("select[name=display_name] option[value='" + value + "']").text();
        $('.bootstrap-select .filter-option').text(label);
        $('select[name=display_name]').val(value);
		$('.bootstrap-select .dropdown-toggle').addClass('btn-sm');
	}
	else if(input=="textarea")
	{
		setting.html("	    <td class='col-md-3'><h5>" + title + "</h5></td> \
							<td class='col-md-8 value'> \
							<form method='POST' action='/settings/' id='" + name + "-form'> \
								<textarea class='form-control' id='id_" + name + "' name='" + name + "' style='resize: vertical' rows='5'>" + value + "</textarea> \
							</td> \
							<td class='col-md-1 edit' style='vertical-align: top'> \
								<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
								<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "');\"> \
							</td> \
						</form> \
					").addClass('editing');
	}
	else if(input=="radio")
	{
		if(value=="Yes" || value=="1")
		{
			setting.html("	    <td class='col-md-3'><h5>" + title + "</h5></td> \
								<td class='col-md-8 value'> \
                                <form method='POST' action='/settings/' id='" + name + "-form'> \
									<input type='radio' id='id_" + name + "' name='" + name + "' value='1' checked> Yes \
                                   	<input type='radio' id='id_" + name + "' name='" + name + "' value='0'> No \
								</td> \
								<td class='col-md-1 edit'> \
									<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
									<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "')\"> \
								</td> \
							</form> \
						").addClass('editing');
		}
		else if(value=="No" || value=="0")
		{
			setting.html("	    <td class='col-md-3'><h5>" + title + "</h5></td> \
								<td class='col-md-8 value'> \
								<form method='POST' action='/settings/' id='" + name + "-form'> \
									<label class='radio-inline'><input type='radio' id='id_" + name + "' name='" + name + "' value='1'>Yes</label> \
                                   	<label class='radio-inline'><input type='radio' id='id_" + name + "' name='" + name + "' value='0' checked>No</label> \
								</td> \
								<td class='col-md-1 edit'> \
									<input class='btn btn-default btn-sm cancel' style='margin-right: 9px' onclick=\"closeSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\" type='button' value='Cancel'/> \
									<input class='btn btn-primary btn-sm' type='button' value='Save' onClick=\"updateSetting('" + title + "','" + input + "','" + name + "')\"> \
								</td> \
							</form> \
						").addClass('editing');
		}
	}
}

function closeSetting(title, name, input, value, username, full_name)
{
	var user					= $('#setting-name'),
		email					= $('#setting-email'),
		password 				= $('#setting-password'),
		class_yr				= $('#setting-class_yr'),
		major					= $('#setting-major'),
		receive_notifications	= $('#setting-receive_notifications'),
		notification_email		= $('#setting-notification_email'),
		display_name			= $('#setting-display_name');
		
	var setting;
			 if(name=="full_name")				{setting = user;}
		else if(name=="email")					{setting = email;}
		else if(name=="password")				{setting = password;}
		else if(name=="class_yr")				{setting = class_yr;}
		else if(name=="major")					{setting = major;}
		else if(name=="receive_notifications")	{setting = receive_notifications;}
		else if(name=="notification_email")		{setting = notification_email;}
		else if(name=="display_name")			{setting = display_name;}

	
	if(name=="password")
	{
		var text_value = "Change your password."; 
		
		setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
                        <td class='col-md-6 value'>" + text_value + "</td> \
                        <td class='col-md-3 edit'><a href='#' class='pull-right' style='display: inherit' onclick=\"editSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\">Edit</a></td> \
                    ");  
	}
	if(input=="text")
	{
		setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
                        <td class='col-md-6 value'>" + value + "</td> \
                        <td class='col-md-3 edit'><a href='#' class='pull-right' style='display: inherit' onclick=\"editSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\">Edit</a></td> \
                    ");  
	}
	if(input=="radio")
	{
		if(value == 0 || value == "No"){ var value_text = "No";}
		else if(value == 1 || value == "Yes"){ var value_text = "Yes";}
		 
		setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
                        <td class='col-md-6 value'>" + value_text + "</td> \
                        <td class='col-md-3 edit'><a href='#' class='pull-right' style='display: inherit' onclick=\"editSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\">Edit</a></td> \
                    ");  
	}
    else if(input=="dropdown-postname")
    {
		setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
                        <td class='col-md-6 value'>" + value + "</td> \
                        <td class='col-md-3 edit'><a href='#' class='pull-right' style='display: inherit' onclick=\"editSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "','" + username + "','" + full_name + "')\">Edit</a></td> \
                    "); 
	}
	else if(input=="textarea")
	{
		setting.html("	<td class='col-md-3'><h5>" + title + "</h5></td> \
                        <td class='col-md-6 value'>" + value + "</td> \
                        <td class='col-md-3 edit' style='vertical-align: top'><a href='#' class='pull-right' style='display: inherit' onclick=\"editSetting('" + title + "', '" + name + "', '" + input + "', '" + value + "')\">Edit</a></td> \
                    ");     
	}
}





function updateSetting(title, input, setting, username, full_name){
            var frm = $("#"+setting+"-form");
            $.ajax({ // create an AJAX call...
                data: frm.serialize(), // get the form data
                type: frm.attr('method'), // GET or POST
                url: frm.attr('action'), // the file to call
                success: function(data){
                    var IS_JSON = true;
                    try
                    {
                       var json = $.parseJSON(data);
                       $('#setting-'+setting).tooltip({
                           placement: 'right',
                           container: 'body',
                           delay: { show: 0, hide: 100 },
                           title: json
                        });
                        $('#setting-'+setting).tooltip('show');
                    }
                    catch(err)
                     {
                        IS_JSON = false;
                        if($('#setting-'+setting).tooltip()){
                            $('#setting-'+setting).tooltip('destroy');
                        }
                        if(setting=="language"){
                        closeSetting(title,setting,input,$('#id_'+setting+' option:selected').text(),$('#id_'+setting+' option:selected').val())
                        }
                        else if(input=="radio"){
                            if($('#id_'+setting+':checked').val()==1){
                                var checked = 'Yes'
                            }
                            else{
                                var checked = 'No'
                            }
                        closeSetting(title,setting,input,checked)
                        }
                        else if(input=="dropdown-postname"){
                        closeSetting(title,setting,input,$('#id_'+setting).val(),username,full_name)
                        }
                        else if(setting=="password"){
                        closeSetting(title,setting,input,'Your password has been successfully changed')
                        }
                        else{
                        closeSetting(title,setting,input,$('#id_'+setting).val())
                        }
                    }
                },
                error: function(data){
                    var errors = jQuery.parseJSON(data);
                    alert(errors)
                }
            });
            return false;
        }