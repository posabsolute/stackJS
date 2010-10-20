


(function() {

	stackJS.environement = "developement";   // environement variable, developement or production 
	
	/* Load logs, CustomIElogs makes logs appears in a overflown window if console is undifined */
	stackJS.logs = true;
	stackJS.CustomIElogs = true;
	stackJS.systemLogs = true;
	stackJS.logJSerrors = false;
	stackJS.logJSerrorsURL = "http://localhost/logjserror.php"
	
	stackJS.configPath = "js/stackJS/conf/"
	/* 	Enable Unit test, 
		you can test each models separatly  or all using "*" NOT IMPLEMENTED */
	stackJS.test = false;
	stackJS.includeTest = [];
	

	stackJS.applicationName = "Cooking"; /* Application name*/

	stackJS.librarySource = 'js/utility/jquery.min.js';	
	/* Load all your plugins dependencies here, they are loaded asynch for now */
	stackJS.Plugins =  ['js/utility/serializeObject.js',
						'js/utility/jquery.fixture.js'];
	
	// Internal framework Files, NOT IMPLEMENTED 
	stackJS.loadFiles = [];	

	stackJS.modules = ["Recipe"]
	
	stackJS.productionJSfile = ['']
	

})()