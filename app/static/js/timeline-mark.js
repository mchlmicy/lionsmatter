function mark(id, status)
{	
	//Submit data
	$.ajax({	type: 'POST',
				url: '/timeline/mark/',
				dataType: 'json',
				data: {id: id, status: status},
				success: function(data) {
                    window.location.reload();
                }
			});
}
