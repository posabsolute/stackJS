/**
 * Recipe Module, control adding, deleting and modifying recipes
 * 
 * @author Cedric Dugas
 */
 Cooking.register(["Chef","Controller"], function(api) {

	return {
 
	 	/**
	     * When the page loads, gets all recipes to be displayed.
	     */
	    load: function(){
 		
			var _this = this;
			$("#addRecipeForm").bind(		"submit", 	function(){ _this.onFormAddRecipeSubmit(this);	 	return false; });
		//	$(".editRecipe").live(			"click",	function(){ _this.onEditRecipeClick(this);			return false; });
		//	$(".cancelAddRecipe").live(		"click", 	function(){ _this.onCancelAddRecipeClick(this);   	return false; });
			$(".destroyRecipe").live(		"click", 	function(){ _this.onDestroyRecipeClick(this); 		return false; }); 
			this.getRecipe()
	    },
	 	/**
	     * When the page loads, gets all recipes to be displayed.
	     */
	    getRecipe: function(){
			api.callFunction({
				Class:["Model",'getRecipe'],
				passData:{callback:["Controller",'listRecipe']} 
			})
	    },
	    /**
	     * Displays a list of recipes and the submit form.
	     * @param {Array} aRecipes An array of Recipe objects.
	     */
	    listRecipe: function(aRecipes){
	        $('#recipeList').html(api.callFunction({
									Class:["View","showListRecipe"],
									passData:aRecipes
								}))
	    },
	    /**
	     * Responds to the create form being submitted by creating a new Recipe.
	     * @param {jQuery} el jQuery add recipe form wrapped element.
	     */
	    onFormAddRecipeSubmit : function(el){
	    	var jQdomForm = $(el);
			var oNewRecipe = jQdomForm.serializeObject();
			api.callFunction({
				Class:["Model",'create'],
				passData:{
					callback:["Controller",'addRecipe'],
					pushData:oNewRecipe
				} 
			})
	        return false;
	    },
	    /**
	     * Responds to the create form being submitted by creating a new Recipe.
	     * @param {Object} oNewRecipe - new recipe object to be send to the view
	     */
	    addRecipe : function(oNewRecipe){
	    	$('#recipeList').append(api.callFunction({
									Class:["View","showAddRecipe"],
									passData:oNewRecipe
								}))
	    },
	    /**
	     * Creates and places the edit interface.
	     */
	    onEditRecipeClick : function(el){
		
	        return false;
	    },
	    /**
	     *  Handle's clicking on a recipe's destroy link.
	     *  @param {jQuery} el The recipe's delete link element.
	     */
	    onDestroyRecipeClick : function(el){
	        var deleteRecipeId = $(el).attr("datas")
			api.callFunction({
				Class:["Model",'destroy'],
				passData:{
					callback:["Controller",'destroyObserver'],
					passData:deleteRecipeId
				} 
			})
	        return false
	    },
	    /**
	     *  Listens for recipes being destroyed and removes them from being displayed.
	     */
	    destroyObserver : function(deleteRecipeId){
	    	var domId = "#recipe"+deleteRecipeId;
	        $(domId).remove();  //removes ALL elements
	    }
	}
})

