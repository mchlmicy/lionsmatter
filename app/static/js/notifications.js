$(document).ready(function(){
    $('div[id^="notifications"]').hover(function() {
        var notifications = $(this).attr("id");
        if(notifications!='notifications'){
            var notifications_cleaned = notifications.split('notifications-')[1];
            var notifications_ids = notifications_cleaned.split('-');
            $.each(notifications_ids, function( index, notification_id ) {
                $.ajax({ // create an AJAX call...
                    data: {'notification_id':notification_id}, // get the form data
                    type: 'POST', // GET or POST
                    url: '/notifications/'+notification_id+'/read/', // the file to call
                    success: function(data){},
                    error: function(data){}
                });
            });
        }
    });
});

function deleteN(id)
{
    var notifications_ids = id.split('-');
    $.each(notifications_ids, function( index, notification_id ) {
            $.ajax({ // create an AJAX call...
                data: {'notification_id':notification_id}, // get the form data
                type: 'POST', // GET or POST
                url: '/notifications/'+notification_id+'/delete/', // the file to call
                success: function(data){
                    location.reload();
                },
                error: function(data){}
            });
        });

	return false;
}

function markN(id)
{
    var notifications_ids = id.split('-');
    $.each(notifications_ids, function( index, notification_id ) {
            $.ajax({ // create an AJAX call...
                data: {'notification_id':notification_id}, // get the form data
                type: 'POST', // GET or POST
                url: '/notifications/'+notification_id+'/read/', // the file to call
                success: function(data){
                    location.reload();
                },
                error: function(data){}
            });
        });

	return false;
}