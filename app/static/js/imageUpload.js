    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#contentWrapper').html("<div id='selectedImage'><button aria-hidden='true' class='close' data-dismiss='alert' type='button'>&times;</button><img id='imagePreview'></img></div>")
                $('#imagePreview').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    $("#id_image").change(function(){
        readURL(this);
    });