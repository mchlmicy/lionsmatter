function commentPost(id){
    var frm = $("#comment_on_"+id+" form");
    $.ajax({ // create an AJAX call...
                data: frm.serialize(), // get the form data
                type: frm.attr('method'), // GET or POST
                url: frm.attr('action'), // the file to call
                success: function(data){
                    if($('#comments-'+id).html()) // post page
                    {
                        var commentDiv = $('#comments-'+id).children('.comment').text();
                        if($.trim(commentDiv)=='No comments at this time.'){
                            $('#comments-'+id).html(data);
                        }
                        else{
                            $('#comments-'+id).append(data);
                        }
                    }
                    else{ // post box in recent_posts
                        $('#post-'+id).find('.comments-container').append(data);
                    }
                    $("#comment_on_"+id+" form .form-control").val('');
                }
            });
}