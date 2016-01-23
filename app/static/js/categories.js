function changeCategory(category,id)
{
var input = document.getElementById("category_input");
document.getElementById("selected_category").innerHTML="Category: "+category;
input.setAttribute("value", ""+id+"");
}