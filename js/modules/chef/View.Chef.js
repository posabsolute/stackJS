
Cooking.register(["Chef","View"], function(api) {


	return {
 
	    showListRecipe : function (data) {
	    	var html = "";
	    	for(var x in data){
	    		html+='<li id="chef'+data[x].id+'">\
							'+data[x].name+'<br />''\
							'+data[x].description+'\
							<td><a href="#"  datas="'+data[x].id+'"  class="destroyRecipe">Delete</a></td>\
						</tr>';		
	    	}
	    	return html;
	    },

	}
});