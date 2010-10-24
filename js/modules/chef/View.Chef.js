
Cooking.register(["Chef","View"], function(api) {


	return {
 
	    showListChef : function (data) {
	    	var html = "";
	    	for(var x in data){
	    		html+='<li id="chef'+data[x].id+'">\
							'+data[x].name+'<br />\
							'+data[x].description+'<br />\
							Associated recipes : <span class="nbrecipes"></span>\
						</li>';		
	    	}
	    	return html;
	    }

	}
});