/* Event Listener */
function listen_deleteComment()
{
    $('a.delete-comment').on('click', function(event){event.preventDefault(); deleteComment($(this).data('id'));});
}
$(document).ready(function(){listen_deleteComment();});

function deleteComment(id)
{
    var footer = "<button type='button' class='btn btn-primary' onclick='deleteCommentAJAX(" + id +")'>Confirm</button><button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>";

    var deleteCommentJSON = '{"footer": "'+ footer +'"}';
    modalCustom('delete-comment', deleteCommentJSON);
}

function deleteCommentAJAX(id)
{
   
    $.ajax({ 	// create an AJAX call...
                data: id, // get the form data
                type: 'POST', // GET or POST
                url: '/comments/'+id+'/delete/', // the file to call
                success: function(data)
				{
                    $('#modalCustom').modal('hide');
                    modal.isDisplayed = false;
					$('#modalCustom').on('hidden.bs.modal', function(e)
					{
                        location.reload();
                    });
                },
                error: function(data)
				{
                    modalAlert('Error', data);
                }
            });
            return false;
}
