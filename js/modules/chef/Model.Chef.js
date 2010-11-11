
Cooking.register(["Chef","Model"], function(api) {

 
	return {
    	 /**
	     * get all recipe's data.
	     * @param {String,Function} oParams - a callback that indicates the next controller function to call.
	     */
	   	getChef : function(oParams){
	   		var _this =  this;
	        $.ajax({
	            url: 'js/utility/fixtures/chef.json',
	            type: 'get',
	            dataType: 'json',
	            fixture: 'js/utility/fixtures/chef.json',
	            success: function (oReceivedData){
					api.callFunction({
						Class:oParams.callback,
						passData:oReceivedData
					})
		    	}
	        })
	    }
 	}
});