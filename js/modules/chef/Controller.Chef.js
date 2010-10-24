/**
 * Recipe Module, control adding, deleting and modifying Chefs
 * 
 * @author Cedric Dugas
 */
 Cooking.register(["Chef","Controller"], function(api) {

	return {
 
	 	/**
	     * When the page loads, gets all chefs to be displayed.
	     */
	    load: function(){
			var _this = this;
			$(".destroyChef").live(	"click", 	function(){ _this.onDestroyRecipeClick(this); 		return false; }); 
			this.getChef()
			api.bridgeCall({
				Class:["Recipe","Controller",'getRecipe'],
				passData:{callback:["Controller",'listChef']} 
			})
			
	    },
	 	/**
	     * When the page loads, gets all chefs to be displayed.
	     */
	    getChef: function(){
			api.callFunction({
				Class:["Model",'getChef'],
				passData:{callback:["Controller",'listChef']} 
			})
	    },
	    /**
	     * Displays a list of chefs 
	     * @param {Array} aChefs - An array of Chef objects.
	     */
	    listChef: function(aChefs){
	        $('#chef').html(api.callFunction({
								Class:["View","showListChef"],
								passData:aChefs
							}))
	    },
	}
})

