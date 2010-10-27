
Cooking.register(["Recipe","View"], function(api) {

 
	return {
 
	    showListRecipe : function (data) {
	    	var html = "";
	    	for(var x in data){
	    		html+='<tr class="recipe" id="recipe'+data[x].id+'">\
							<td>'+data[x].name+'</td>\
							<td>'+data[x].description+'</td>\
							<td><a href="#"  datas="'+data[x].id+'"  class="destroyRecipe">Delete</a></td>\
						</tr>';		
	    	}
	    	return html;
	    },
	    showAddRecipe : function (data) {
	    		var html='<tr class="recipe" id="recipe'+data.id+'">\
							<td>'+data.name+'</td>\
							<td>'+data.description+'</td>\
							<td><a href="#"  datas="'+data.id+'"  class="destroyRecipe">Delete</a></td>\
						</tr>';
	    	return html;
	    }
	}
});