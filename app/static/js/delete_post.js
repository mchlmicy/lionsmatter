/* Event Listener */
function listen_deletePost()
{
    $('a.delete-post').on('click', function(event){event.preventDefault(); deletePost($(this).data('id'));});
}
$(document).ready(function(){listen_deletePost();});

function deletePost(id)
{
    var footer = "<button type='button' class='btn btn-primary' onclick='deletePostAJAX("+ id +")'>Confirm</button><button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";

    var deletePost_JSON = '{"footer": "'+ footer +'"}';
    modalCustom('delete-post', deletePost_JSON);
}

function deletePostAJAX(id)
{
    console.log('run');
	$.ajax({ 	// create an AJAX call...
				data: id, // get the form data
				type: 'POST', // GET or POST
				url: '/post/'+id+'/delete/', // the file to call
				success: function(data)
				{
                    $('#modalCustom').modal('hide');
                    modal.isDisplayed = false;
					$('#modalCustom').on('hidden.bs.modal', function(e)
					{
						var viewedpage = location.pathname;

						if(viewedpage.indexOf('post')==1)
						{
							window.location = "/";
						}
						else
						{
							location.reload();
						}
					});
				},
				error: function(data)
				{
					modalAlert('Error', 'An error occured while deleting the post.  Please try again.');
				}
			});
			
	return false;
}