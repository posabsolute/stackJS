


(function() {

	stackJS.environement = "developement";   // environement variable, developement or production 
	
	/* Load logs, CustomIElogs makes logs appears in a overflown window if console is undifined */
	stackJS.logs = true;
	stackJS.CustomIElogs = true;
	stackJS.systemLogs = true;
	stackJS.logJSerrors = false;
	
	/* 	Enable Unit test, 
		you can test each models separatly  or all using "*" NOT IMPLEMENTED */
	stackJS.test = false;
	stackJS.includeTest = [];
	
	
	stackJS.pluginPath = 'js/utility/';  /* Application plugins repository path */
	stackJS.applicationName = "Cooking"; /* Application name*/

	stackJS.librarySource = 'js/utility/jquery.min.js';	
	/* Load all your plugins dependencies here, they are loaded asynch for now */
	stackJS.Plugins = ['serializeObject.js','jquery.fixture.js', "shit.js"];
	
	// Internal framework Files, NOT IMPLEMENTED 
	stackJS.loadFiles = [];	

	stackJS.modules = ["Recipe"]
	
	stackJS.productionJSfile = ['']
	

})()