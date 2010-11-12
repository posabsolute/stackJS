


(function() {
  
	stackJS.Conf.environement = "developement";   // environement variable, developement or production 
	
	/* Load logs, CustomIElogs makes logs appears in a overflown window if console is undifined */
	stackJS.Conf.logs = true;
	stackJS.Conf.customIElogs = true;
	stackJS.Conf.systemLogs = true;
	
	/* Log js errors using window.onerror , NOT IMPLEMENTED */
	stackJS.Conf.logJSerrors = false;
	stackJS.Conf.logJSerrorsURL = "http://localhost/logjserror.php"
	
	stackJS.Conf.configPath = "js/stackJS/conf/"
	stackJS.Conf.modulePath = "js/modules/"
	
	/* 	Enable Unit test, 
		you can test each models separatly  or all using "*" NOT IMPLEMENTED */
	stackJS.Conf.test = false;
	stackJS.Conf.includeTests = [];
	
	/* global Class Names, can be overwritten per module */
	stackJS.Conf.moduleClassNames= ["Model","Controller","View"]

	stackJS.Conf.applicationName = "Cooking"; /* Application name*/

	stackJS.Conf.librarySource = 'js/utility/jquery.min.js';	
	/* Load all your plugins dependencies here, they are loaded asynch for now */
	stackJS.Conf.Plugins =  ['js/utility/serializeObject.js',
							 'js/utility/jquery.fixture.js',
							 'js/utility/pubsub.js'];


	/* Extras are plugins for stackJS and NOT for the app */
	stackJS.Conf.Extras = ["Sammy","Router"]
	
	stackJS.Conf.Extras.Sammy = {
		file: stackJS.Conf.stackJSpath + "sammy/min/sammy-latest.min.js"
	}
	stackJS.Conf.Extras.Router = {
		file: stackJS.Conf.configPath+"router.js"
	}

	stackJS.Conf.modules = ["Recipe", "Chef"]
	
	// stackJS.Conf.productionJSfile = ['']
	

})()