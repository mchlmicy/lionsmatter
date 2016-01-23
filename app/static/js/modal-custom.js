/* Event Listener */
function listen_modalCustom()
{
    $('a.modal-custom').on('click', function(event){event.preventDefault();});
}
$(document).ready(function(){listen_modalCustom();});

// modal object
var modal;

// reference

// modal object constructor
function Modal(modalType, vars)
{
    // reference
	this.body,
    this.header,
    this.footer,
    this.type = modalType,
    this.vars; if(vars!=null){this.vars = JSON.parse(vars);}

    // templates
    this.simplicity_template = ['alert', 'alert-anonymousPrivacy', 'alert-followBadge', 'alert-goldBadge', 'alert-responseBadge', 'delete-comment', 'delete-post'],
    this.structure_template =  ['{"name": "alert", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "alert-anonymousPrivacy", "header": "User Privacy", "body": "This user has chosen to remain anonymous; we cannot share their profile information.", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "alert-followBadge", "header": "Badge Info", "body": "You are following this post.", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "alert-goldBadge", "header": "Badge Info", "body": "This post has been nominated for administration response.", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "alert-responseBadge", "header": "Badge Info", "body": "There has been an administration response to this post.", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "department-badge", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "delete-comment", "header": "Confirm", "body": "Are you sure you want to delete this comment?"}',
                                '{"name": "delete-post", "header": "Confirm", "body": "Are you sure you want to delete this post?"}',
                                '{"name": "photo-popup", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "share-popup", "header": "Share <span style=\'0px 9px\'>|</span> LionsMatter", "subheader": "Where would you like to share this post?", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "terms-of-service", "header": "Terms of Service <span style=\'0px 9px\'>|</span> LionsMatter", "subheader": "Rules for using LionsMatter", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "timeline-update", "header": "Update Timeline"}',
                                '{"name": "vine-popup_display", "footer": "<button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Close</button>"}',
                                '{"name": "vine-popup_input", "header": "Vine <span style=\'0px 9px\'>|</span> LionsMatter", "subheader": "Submit a Vine link with your post.", "body": "<div style=\'text-align: center\'><div class=\'form-group\' style=\'margin-top: 10px\'><label class=\'control-label\' style=\'display: none; margin-bottom: 15px\'>Error: Please provide a link to a valid Vine.</label><input id=\'vineModalINPUT\' type=\'text\' class=\'form-control\' style=\'display: inline-block; width: 75%\' placeholder=\'Vine link\'/></div><p style=\'display: inline-block; font-size: 85%; text-align: left; width: 75%\'><strong>Note:</strong> If you intend to post anonymously, you should know that Vine posts will display your account information by default. LionsMatter will not discriminate, however, against throwaway Vine accounts (which are anonymous).</p></div>"}'];

    
	// settings
    this.simplicity = function(){if($.inArray(this.type, this.simplicity_template) == -1){return 'complex';} else{return 'simple';}}
	this.isDisplayed = false;

	// HTML elements
	this.HTML_shell = $("<div class='modal fade' id='modalCustom' tabindex='-1' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'></div></div></div>"),
    this.HTML_trigger = "<a href='#modalCustom' id='modalCustomButton' data-toggle='modal'></a>",
    this.HTML_content = function(modalTitle, modalBody, modalFooter){return "<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>"+ modalTitle +"</div><div class='modal-body'>"+ modalBody +" </div><div class='modal-footer'>"+ modalFooter +"</div>";},
    this.HTML_header = function(modalHeader){return "<h4 class='modal-title'>"+ modalHeader +"</h4>";},
    this.HTML_subheader = function(modalSubheader){return "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>"+ modalSubheader +"</h5>"};

    // simple functions
    this.construct = function()
    {
        var template = this.findTemplate();

        if(this.simplicity()=='complex'){$(this.HTML_shell).addClass('lionsmatter');}
        if(template.subheader != null){this.header = this.HTML_header(template.header) + ' ' + this.HTML_subheader(template.subheader);}else if(template.header != null){this.header = this.HTML_header(template.header);}else{this.customHeader();}
        if(template.body != null){this.body = template.body;}else{this.customBody();}
        if(template.footer != null){this.footer = template.footer;}else{this.customFooter();}

        $(this.HTML_shell).find('.modal-content').html(this.HTML_content(this.header, this.body, this.footer)).append(this.HTML_trigger);
        $(this.HTML_shell).on('hidden.bs.modal', function()
        {
            this.remove();
            modal.isDisplayed = false;

            if(modal.hasOwnProperty('redirect')&& modal.vars['redirect']!=null){window.location = modal.vars['redirect'];}
        });
    }
    this.findTemplate = function()
    {
        for(x = 0; x < this.structure_template.length; x++){if(JSON.parse(this.structure_template[x]).name==this.type){return JSON.parse(this.structure_template[x]);}}return 'failure';
    }
}// modal methods
Modal.prototype.customHeader = function()
{
    if(this.type == 'department-badge' && this.vars['fullname']!=null && this.vars['position']!=null && this.vars['department'] !=null){if(this.vars['profile']){this.header = "<h4 class='modal-title'><a class='link-colorinherit' href='" + this.vars['profile'] + "'>" + this.vars['fullname'] + "</a></h4><h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>" + this.vars['position'] + ", " + this.vars['department'] + "</h5>";} else{this.header = "<h4 class='modal-title'>" + this.vars['fullname'] + "</h4><h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>" + this.vars['position'] + ", " + this.vars['department'] + "</h5>";}}
    else if(this.type == 'photo-popup' && this.vars['display_name']!=null && this.vars['timestamp']!=null){var header; if(this.vars['profile']!=null && this.vars['display_name']!='anonymous'){header = "<h4 class='modal-title'>Photo by <a class='link-colorinherit' href='" + this.vars['profile'] + "'>" + this.vars['display_name'] + "</a></h4>";} else{header = "<h4 class='modal-title'>Photo by " + this.vars['display_name'] + "</h4>";} if(this.vars['timestamp-alt']!=null){this.header = header + "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>Submitted <a href='#' class='link-colorinherit' onclick='event.preventDefault(); var alt_time = $(this).data(\"alttime\"); $(this).data(\"alttime\", $(this).html()); $(this).html(alt_time)' data-alttime='"+ this.vars['timestamp-alt'] +"' title='"+ this.vars['timestamp-alt'] +"'>" + this.vars['timestamp'] + "</h5>";} else{this.header = header + "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>Submitted " + this.vars['timestamp'] + "</h5>";}}
    else if(this.type == 'vine-popup_display' && this.vars['display_name']!=null && this.vars['timestamp']!=null)
    {
        var header;

        if(this.vars['profile']!=null && this.vars['display_name']!='anonymous'){header = "<h4 class='modal-title'>Vine by <a class='link-colorinherit' href='" + this.vars['profile'] + "'>" + this.vars['display_name'] + "</a></h4>";}
        else{header = "<h4 class='modal-title'>Vine by " + this.vars['display_name'] + "</h4>";}

        /* Temporarily broken
        if(this.vars['timestamp-alt']!=null)
        {
            this.header = header + "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>Submitted <a href='#' class='link-colorinherit' onclick='alert(\"Win\")'>"+ this.vars['timestamp'] +"</h5>";

            // Notes
            // data-alttimestamp='"+ this.vars['timestamp-alt'] +"'
            // data-alttime: data-alttime='"+ this.vars['timestamp-alt'] +"'
            // title: title='"+ this.vars['timestamp-alt'] +"'
            // timestamp: title='"+ this.vars['timestamp-alt'] +"'
            // onclick: onclick='event.preventDefault(); var alt_time = $(this).data(\"alttimestamp\"); $(this).data(\"alttimestamp\", $(this).html()); $(this).html(alt_time)'
        }*/
        if(this.vars['timestamp-alt']!=null){this.header = header + "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>Submitted <span title='"+ this.vars['timestamp-alt'] +"'>" + this.vars['timestamp'] + "</span></h5>";}
        else{this.header = header + "<h5 class='text-muted' style='margin-top: 0px; margin-bottom: 0px'>Submitted " + this.vars['timestamp'] + "</h5>";}
    }
    else if(this.vars['header']!=null){this.header = this.HTML_header(this.vars['header']);}
    else
    {
        console.log('a customHeader() function for this modal-type has not been defined or dataFields are missing.');
    }
}
Modal.prototype.customBody = function()
{
         if(this.type == 'department-badge' && this.vars['address']!=null && this.vars['email']!=null && this.vars['phone']!=null){var body = "<strong>Contact Info</strong><br/>"; if(this.vars['profile']){body = body + "<span class='glyphicon glyphicon-user' style='margin-right: 9px'></span><a href='"+ this.vars['profile'] +"'>Profile</a><br/>";} body = body + "<span class='glyphicon glyphicon-home' style='margin-right: 9px'></span>"+ this.vars['address'] +"<br/><span class='glyphicon glyphicon-envelope' style='margin-right: 9px'></span><a >"+ this.vars['email'] +"</a><br/><span class='glyphicon glyphicon-earphone' style='margin-right: 9px'></span>" + this.vars['phone']; if(this.vars['bio']!=null){body = body + "<p style='text-align: justify'>"+ this.vars['bio'] +"</p>";} this.body = body;}
    else if(this.type == 'photo-popup' && this.vars['photo_url']!=null){this.body = "<center><a href='" + this.vars['photo_url'] + "'><img class='img-rounded' src='" + this.vars['photo_url'] + "' style='border: 1px solid #e3e3e3; max-height: 50%; max-width: 66%'/></a></center>";}
    else if(this.type == 'share-popup' && this.vars['site-names']!=null && this.vars['site-links']!=null){var body = '<div>'; for(x = 0; x< this.vars['site-names'].length; x++){if(this.vars['site-names'][x]=='Facebook'){var img = '/img/ui/facebook-image.png';} else if(this.vars['site-names'][x]=='Twitter'){var img = '/img/ui/twitter-image.png';} body = body + "<a class='thumbnail' style='display: inline-block; margin: 0% 5%; width: 33%' href='" + this.vars['site-links'][x] + "'><img src='" + img + "'/></a>";}body = body + '</div>'; this.body = body;}
    else if(this.type == 'terms-of-service'){this.body = "<div style='border: 1px solid #e3e3e3; border-radius: 4px; box-shadow: inset 1px 1px 3px #e3e3e3; max-height: 200px; overflow-y: scroll; padding: 9px 18px'><h4>Introduction</h4><p style='text-align: justify'>By using LionsMatter you agree to the terms and conditions that follow. These terms you agree to are not intended to abridge your right to free speech but rather to ensure that everyone has the right to a respectful dialogue on the website.</p><p style='text-align: justify'>Please remember that you use LionsMatter as a service, it is not a right and if you willfully disregard these terms of service you will be banned from the site.</p><hr style='margin: 18px 0px'/><h4>Using LionsMatter</h4><p style='text-align: justify'>When you post to LionsMatter you understand that what you say may be directed towards administrative departments and organizations at The College of New Jersey. As a service that seeks to bridge the gap between students and administration, LionsMatter holds these organizations in high esteem and will not tolerate malicious statements made about the TCNJ community.</p><p style='text-align: justify'>The following points are meant to serve as a guide to the type of actions that will not be tolerated on LionsMatter – this is not an exhaustive list. </p><p style='padding-left: 36px; text-align: justify'>DISRESPECTFUL LANGUAGE AND CONDUCT will not be tolerated on LionsMatter because it discourages earnest discussion on the website. </p><p style='padding-left: 36px; text-align: justify'>POSTING OBSCENE CONTENT to LionsMatter will result in an immediate ban from the site. There is no reason to post obscene content, and doing so will not be tolerated.</p><p style='padding-left: 36px; text-align: justify'>RIDICULING OR CALLING OUT AN INDIVIDUAL is not in line with the philosophy of LionsMatter, which emphasizes the possibility of changing conditions over assigning blame. </p><p style='text-align: justify'>In the case that LionsMatter determines a user is acting maliciously the site reserves the right to respond with the actions it sees best fit, which range from a warning to a ban from the site.</p><hr style='margin: 18px 0px'/><p class='pull-left' style='display: inline-block; width: 12%'><strong>tl;dr</strong></p><p class='pull-right' style='display: inline-block; text-align: justify; width: 88%'>To be in full compliance with the rules of LionsMatter, a user only needs to treat other users with respect.</p></div>";}
    else if(this.type == 'timeline-update' && this.vars['type_id']!=null && this.vars['type_name']!=null && this.vars['page_location_id']!=null && this.vars['page_location_name']!=null && this.vars['description_id']!=null && this.vars['description_name']!=null && this.vars['happens_when_id']!=null && this.vars['happens_when_name']!=null){this.body = "<form id=\'update-form\' action=\'/timeline/\' method=\'post\'><div class=\'form-group\'><label class=\'control-label\'>Report</label><select class=\'selectpicker\' onchange='modal.customScript(\"switchForm\")' data-width=\"100%\" id=\'"+this.vars['type_id']+"\' name=\'"+this.vars['type_name']+"\'><option value=\'break\'>Break (web-end problem)</option><option value=\'bug\'>Bug (code-end problem)</option><option value=\'css\'>CSS</option><option value=\'html\'>HTML</option><option value=\'js\'>JavaScript</option><option value=\'todo\'>Needs Coding</option><option value=\'python\'>Python</option><option value=\'suggestion\'>Suggestion</option><option value=\'tail\'>Tail</option></select></div><div class=\'form-group\'><label class=\'control-label\'>Location</label><input class=\'form-control\' id=\'"+this.vars['page_location_id']+"\' name=\'"+this.vars['page_location_name']+"\' placeholder=\'Page location (be concise).\' type=\'text\'/></div><div class=\'form-group\'><label class=\'control-label\'>Description</label><textarea class=\'form-control\' id=\'"+this.vars['description_id']+"\' name=\'"+this.vars['description_name']+"\' placeholder=\'Report description.\' rows=\'3\' style=\'resize: none\'></textarea></div><div class=\'form-group\'><label class=\'control-label\'>Occurance</label><textarea class=\'form-control\' id=\'"+this.vars['happens_when_id']+"\' name=\'"+this.vars['happens_when_name']+"\' placeholder=\'Circumstance where the problem occurs (not required).\' rows=\'3\' style=\'resize: none\'></textarea></div></form>"; $(this.HTML_shell).one('show.bs.modal', function(){modal.customScript('bootstrapSelect');});}
    else if(this.type == 'vine-popup_display' && this.vars['vine_url']!=null){var vine_url = this.vars['vine_url']; this.body = "<center><div class='load-message' style='position: absolute; top: 100px; width: 100%'><div class='message' style='color: #404040; font-weight: bold; margin-right: 40px'>Loading Vine...</div></div><iframe src='' class='vine-embed' height='220px' frameborder='0' style='background-color: #e3e3e3; border: 1px solid #404040; border-radius: 4px'></iframe><script async src='//platform.vine.co/static/scripts/embed.js' charset='utf-8'></script></center>"; $(this.HTML_shell).one('shown.bs.modal', function(){modal.customScript();});}
    else if(this.vars['body']!=null){this.body = this.vars['body'];}
    else
    {
        console.log('a customBody() function for this modal-type has not been defined or dataFields are missing.');
    }
}
Modal.prototype.customFooter = function()
{
         if(this.type == 'timeline-update'){this.footer = "<button type=\'button\' onclick=\'modal.customScript(\"submitTimeline\")\' class=\'btn btn-primary\'>Submit</button><button type=\'button\' class=\'btn btn-default\' data-dismiss=\'modal\'>Cancel</button>";}
    else if(this.type == 'vine-popup_input'){this.footer = "<button type='button' class='btn btn-primary' onclick='modal.customScript()'>Submit</button><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>";}
    else if(this.vars['footer']!=null){this.footer = this.vars['footer'];}
    else
    {
        console.log('a customFooter() function for this modal-type has not been defined or dataFields are missing.');
    }
}
Modal.prototype.customScript = function(function_name)
{
    if(this.type == 'timeline-update'){if(function_name == 'bootstrapSelect'){$('.selectpicker').selectpicker();} else if(function_name == 'submitTimeline'){var frm = $('form#update-form'); $.ajax({type: frm.attr('method'), url: frm.attr('action'), dataType: 'json', data: frm.serialize(), success: function(data){$('#modalCustom').modal('hide'); window.location.reload();}, error: function(data){error = $.parseJSON(data.responseText); frm.closest('form').find('input,textarea').each(function(i){$(this).parent().removeClass('has-error');}); $.each(error, function(key, value){$("[name='"+key+"']").parent().addClass('has-error');}); $("#errorWrapper").html("<div class='alert alert-danger' style='margin-bottom: 9px'><button aria-hidden='true' class='close' data-dismiss='alert' type='button'>&times;</button><b>Woops!</b> "+error+"</div>");}});} else if(function_name == 'switchForm'){var form = $('#update-form select.selectpicker').val(); if(form == 'css' || form == 'html' || form == 'js' || form == 'python'){$('#update-form .form-group:nth-child(2) .control-label').html('Title'); $('#update-form .form-group:nth-child(2)').css('display','inherit');} else if(form == 'suggestion'){$('#update-form .form-group:nth-child(2)').css('display','none');} else{$('#update-form .form-group:nth-child(2) .control-label').html('Location'); $('#update-form .form-group:nth-child(2)').css('display','inherit');} if(form != 'break' && form != 'bug'){$('#update-form .form-group:nth-child(4)').css('display','none');} else{$('#update-form .form-group:nth-child(4)').css('display','inherit');}}}
    else if(this.type == 'vine-popup_display' && this.vars['vine_url']!=null){vineLoadERROR = setTimeout(function(){var vine_url = modal.vars['vine_url']; $('#modalCustom .modal-content iframe.vine-embed').attr('src',''); $('#modalCustom .modal-content .modal-body .load-message').html('<div class="message" style="color: #404040; font-weight: bold; margin-right: 40px">Woops! This Vine failed to load.<br/>View it directly <a href="'+ vine_url +'" target="_blank">here</a>.</div>');},7500); $('#modalCustom .modal-content iframe.vine-embed').load(function(){if($(this).attr('src').length>0){clearTimeout(vineLoadERROR); $('#modalCustom .modal-content .modal-body .load-message').remove(); $('#modalCustom .modal-content iframe.vine-embed').css('background-color', '#000000');}}); $('#modalCustom .modal-content iframe.vine-embed').attr('src', this.vars['vine_url']+'/embed/simple');}
    else if(this.type == 'vine-popup_input' && this.vars['form-id']){$.ajax({type: 'POST', url: '/vine/validate/', dataType: 'json', data: {vine_url: $('#vineModalINPUT').val()}, success: function(json){$('#id_image').val(''); $('#post-textarea #selectedImage button.close').click(); $('#'+modal.vars['form-id']).val(json.vine_url); $('#post-textarea #contentWrapper').append('<div id="selectedVine"><button aria-hidden="true" onclick="$(\'#id_vine\').val(\'\')" class="close" data-dismiss="alert" type="button">×</button><div class="load-message" style="margin-top: 48px; position: absolute; text-align: center; width: 172px"><div class="message" style="color: #404040; font-weight: bold">Loading Vine...</div></div><iframe src="" class="vine-embed" height="172px" width="172px" frameborder="0" style="background-color: #e3e3e3; border: 1px solid #404040; border-radius: 4px"></iframe><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script></div>'); $('#modalCustom').modal('hide'); vineLoadERROR = setTimeout(function(){$('#post-textarea #selectedVine iframe.vine-embed').attr('src',''); $('#post-textarea #selectedVine .load-message').html('<div class="message" style="color: #404040; font-weight: bold">Woops! This Vine failed to load.<br/>View it directly <a href="'+ json.vine_url +'" target="_blank">here</a>.</div>');},7500); $('#post-textarea #selectedVine iframe.vine-embed').load(function(){if($(this).attr('src').length>0){clearTimeout(vineLoadERROR); $('#post-textarea #selectedVine .load-message').remove(); $('#post-textarea #selectedVine iframe.vine-embed').css('background-color', '#000000');}}); $('#post-textarea #selectedVine iframe.vine-embed').attr('src', json.vine_url + '/embed/simple');}, error: function(){if(!$('#vineModalINPUT').parent().hasClass('has-error')){$('#vineModalINPUT').parent().addClass('has-error').find('.control-label').css('display', 'inherit'); $('#modalCustom').one('hidden.bs.modal', function(){$('#'+modal.vars['form-id']).removeClass('error').css('border-color', '#ccc');});}}});}
    else if(this.vars['script']!=null){this.script = this.vars['script'];}
    else
    {
        console.log('a customScript() function for this modal-type has not been defined or dataFields are missing.');
    }
}

// create modal function
function modalCustom(modalType, vars)
{	
	// check if modal is already displayed
    if(modal == null || modal.isDisplayed == false)
    {
        // create & display modal
        modal = new Modal(modalType, vars)
        modal.construct();

        $(modal.HTML_shell).appendTo('body');
        $('#modalCustomButton').click();
        modal.isDisplayed = true;
    }
    else
    {
        // display nothing
    }
}