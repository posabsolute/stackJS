


(function() {
  
	stackJS.Conf.environement = "developement";   // environement variable, developement or production 
	
	/* Load logs, CustomIElogs makes logs appears in a overflown window if console is undifined */
	stackJS.Conf.logs = true;
	stackJS.Conf.customIElogs = false;
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
	stackJS.Conf.Plugins =  ['order!js/utility/jquery.min.js',
							 'order!js/utility/serializeObject.js',
							 'order!js/utility/jquery.fixture.js',
							 'order!js/utility/pubsub.js'];
	
	// stackJS.Conf.productionJSfile = ['']
	

})()