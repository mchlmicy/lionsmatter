function get(type){
    $.ajax({ // create an AJAX call...
        data: {'get': type}, // get form data
        type: 'POST', // GET or POST
        beforeSend: function() {
            $('#recent_posts').css('opacity','0.4');

            },
        url: window.location.pathname, // the file to call
        dataTypes: 'html',
        success: function(data){
            $('#recent_posts').css('opacity','1').html(data);
            },
        error: function(data){
            var errors = jQuery.parseJSON(data);
            alert(errors)
            }
        });
}