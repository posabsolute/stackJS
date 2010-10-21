
Cooking.register(["Chef","Model"], function(api) {


	return {
    	 /**
	     * get all recipe's data.
	     * @param {String,Function} fCallback a callback that indicates the next controller function to call.
	     */
	   	getRecipe : function(oParams){
	   		var _this =  this;
	        $.ajax({
	            url: 'js/utility/fixtures/recipes.json',
	            type: 'get',
	            dataType: 'json',
	            fixture: 'js/utility/fixtures/recipes.json',
	            success: function (oReceivedData){
					api.callFunction({
						Class:oParams.callback,
						passData:oReceivedData
					})
		    	},
		    	 error: function(request, status, error) {
	               console.log(error)
	            }

	        })
	    },
	    /**
	     * Updates a recipe's data.
	     * @param {String} id A unique id representing your recipe.
	     * @param {Object} attrs Data to update your recipe with.
	     * @param {Function} success a callback function that indicates a successful update.
	     * @param {Function} error a callback that should be called with an object of errors.
	     */
	    update : function(id, attrs, success, error){
	        $.ajax({
	            url: '/recipes/'+id,
	            type: 'put',
	            dataType: 'json',
	            data: attrs,
	            success: success,
				error: error,
	            fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
            
	        })
	    },
	    /**
	     * Destroys a recipe's data.
	     * @param {String} id A unique id representing your recipe.
	     * @param {String,Function} fCallback a callback function that indicates a successful destroy.
	     */
	    destroy : function(oParams){
	    	var _this =  this;
	        $.ajax({
	            url: '/recipes/'+id,
	            type: 'delete',
	            dataType: 'json',
	            success: function (){
		    		api.callFunction({
						Class:oParams.callback,
						passData:oParams.pushData
					})
		    	},
		    	 error: function(request, status, error) {
	               console.log(error)
	        	},
	            fixture:"-restDestroy" //uses $.fixture.restDestroy for response.
	        })
	    },
	    /**
	     * Creates a recipe.
	     * @param {json} jNewRecipeData new recipe data sent to the server.
	     * @param {Function} fCallback a callback function that indicates a successful destroy.
	     */
	    create : function(oParams){
	    	var _this =  this;
	        $.ajax({
	            url: '/recipes',
	            type: 'post',
	            dataType: 'json',
				data: oParams.pushData
	             success: function (){
		    		api.callFunction({
						Class:oParams.callback,
						passData:oParams.pushData
					})
		    	},
	            data:jNewRecipeData,
	            fixture: "-restCreate" //uses $.fixture.restCreate for response.
	        })
	    }
 	}
});