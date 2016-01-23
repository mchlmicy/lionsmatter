function listen_post()
{
    $('#post-textarea .buttonpanel .dropdown-menu li a').on('click', function(event){event.preventDefault();});
}
$(document).ready(function(){listen_post();});

function readURL(input)
{
    if(input.files && input.files[0])
    {
        if(isImage(input.files[0].type))
        {
            var reader = new FileReader();

            reader.onload = function(e)
            {
                $('#id_vine').val(''); $('#post-textarea #selectedVine button.close').click();

                $('#contentWrapper').html('<div id="selectedImage"><button aria-hidden="true" class="close" data-dismiss="alert" onclick="$(\'#id_image\').val(\'\')" type="button">&times;</button><img id="imagePreview"></img></div>');
                $('#imagePreview').attr('src', e.target.result);
            };
            $("#errorWrapper").html('');
            
            reader.readAsDataURL(input.files[0]);
        }
        else
        {
            $("#errorWrapper").html("<div class='alert alert-danger' style='margin-bottom: 9px'><button aria-hidden='true' class='close' data-dismiss='alert' type='button'>&times;</button><b>Woops!</b> Only photos can be uploaded.</div>");
            $("#id_image").val('');
            $("#contentWrapper").html('');
        }
    }
}

$("#id_image").change(function()
{
    readURL(this);
});

function gen_uuid() {
    var uuid = '';
    for (var i=0; i < 32; i++) {
        uuid += Math.floor(Math.random() * 16).toString(16);
    }
    return uuid
}

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'image/jpeg':
    case 'image/gif':
    case 'image/png':
        return true;
    }
    return false;
}


$('#post-textarea form').submit(function(){
    var fileInput = $('#id_image').val();
    var continueCheck = 'True';
    event.preventDefault();
    var data = new FormData($(this).get(0));
    var form = $(this).attr("id");
    $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        beforeSend : function (){
            $('#submitPost').addClass('disabled');
            if(fileInput == '' || typeof fileInput === 'undefined'){}
            else{$("#errorWrapper").html("<div class='alert alert-info' style='margin-bottom: 9px'><img src='/img/ui/spinner.gif'> Your image is being uploaded...</div>");}
        },
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data) {
            $("#errorWrapper").html('');
            $("#contentWrapper").html('');
            $('#submitTo').text('Department');
            $("#errorWrapper").html("<div class='alert alert-success' style='margin-bottom: 9px'><button aria-hidden='true' class='close' data-dismiss='alert' type='button'>&times;</button><b>Success!</b> You've successfully posted to LionsMatter.</div>");
            function update_recent_posts() {
                $('#id_post').val('');
                $('#id_image').val('')
                if ($("#recent_posts").text().trim() == "No posts were found.") {
                    $('#recent_posts').html(data);
                }
                else{
                    $('#recent_posts').prepend(data);
                }
            }
            update_recent_posts();
        },
        error: function(data) {
            $('#submitPost').removeClass('disabled')
            error = $.parseJSON(data.responseText);
            $.each(error, function(index, value) {
                $("#errorWrapper").html("<div class='alert alert-danger' style='margin-bottom: 9px'><button aria-hidden='true' class='close' data-dismiss='alert' type='button'>&times;</button><b>Woops!</b> "+value.toString()+"</div>");
            });
        }
    });
    return false;
});