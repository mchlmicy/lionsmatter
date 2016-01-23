$(document).ready(function(){
    $('#id_sort').on('change', function() {
        var sort = $("#id_sort").find(":selected").val();
        var feed_search = window.location.pathname;
        var feed_found = feed_search.split('/');
        if(! feed_found[2]){
            var feedtag = 'f';
            var feed = 'all';
        }
        else{
            var feedtag = feed_found[1];
            var feed = feed_found[2];
        }
        $.ajax({ // create an AJAX call...
                type: 'POST', // GET or POST
                url: '/'+feedtag+'/'+feed+'/'+sort+'/', // the file to call
                beforeSend: function() {
                    $('#recent_posts').css('opacity','0.4');
                },
                success: function(data){
                    $('#recent_posts').css('opacity','1').html(data);
                },
                error: function(data){
                    var errors = jQuery.parseJSON(data);
                    alert(errors)
                }
            });
    });
});