/**
 * stackJS is a small framework to consolidate your javascript architecture
 * @author Cedric Dugas
 */
 
var stackJS = {
	 /** 	Start Loading file configurations */
	init: function(){
		this.Conf = {};
		this.loadRequireJS();
	},
	 /**	Load the require.js library that will handle files insertion */
	loadRequireJS : function(){
		
		var jsSrc  = document.getElementById("stackJS").src;
		var jsQry = jsSrc.substr(jsSrc.indexOf("?")+1)
		var jsQry = jsQry.split("&")

		for(var i in jsQry){
			var addConf = jsQry[i].split("=");
			var addConfParams = addConf[1].split(",")
			window["stackJS"]["Conf"][addConf[0]] = addConfParams;
		}
		var reqJsPath = stackJS.Conf.stackJSpath + "requirejs/build/require/"
		
		this.insertJSfiles({
			path:reqJsPath,
			file:'allplugins-require.js',
			callback:function(){stackJS.loadConfiguration();}
		})
	},
 	/**
 	 * Gets the params for the file url 
     * Load the global conf files
     */
	loadConfiguration : function(){
		var globalConf = stackJS.Conf.stackJSpath + "conf/conf.global.js"
		require([globalConf], function() {
			stackJS.loadMVC();
		});
	},
	/**
     * Inject CSS files into the head
     * @param {String} sFileInsert - Contains the url to insert the css file
     * 
     */
	insertCSSfiles :function(sFileInsert){
	    var link = document.createElement("link");
	    link.type = "text/css";
	    link.rel = "stylesheet";
	    link.href = sFileInsert;
	    document.getElementsByTagName("head")[0].appendChild(link);
	},	
	 /**
     * Inject javascript files into the head
     * @param {Object} oFileInsert - Contains the information to insert the js file
     * @param {Object} oParams - parameters to send to the callback
     */
	insertJSfiles : function(oFileInsert, oParams){
		if(!oFileInsert.callback) {oFileInsert.callback = function(){};}
		var createElements = document.createElement('script');
		createElements.type = "text/javascript";
		if ('undefined' != typeof(createElements.addEventListener)) {
			createElements.addEventListener('load', function(){		oFileInsert.callback(oParams)}, true);
		 	createElements.addEventListener('error',function(ev){	stackJS.errorInsert(ev, oFileInsert.callback, oParams )} , true);
		}else{
				if ('undefined' != typeof(createElements.attachEvent)) { // IE version of addEventListener
			    	createElements.onreadystatechange= function () {
					   if (this.readyState == 'complete' || this.readyState == 'loaded' ){
					   		oFileInsert.callback(oParams);
					   }else if(this.readyState == 0){
					   		this.errorInsert(this.readyState, oFileInsert.callback, oParams );
					   }
					}
		    	}else{
					console.systemLog("cannot load framework, stop breaking me")
				}
		}
		createElements.src = oFileInsert.path + oFileInsert.file;
	
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(createElements);
	},
	/**
     * logs files that are not loading, missing files can cause framework failures
     * @param {Object} oReadyState Error object extracted from the event
     * @param {String} sFilename - name of the js file
     * @param {Function} fCallback - a callback to be executed when the file is loaded.
     */
	errorInsert : function(oReadyState,fCallback, oParams){
		console.systemLog("Cannot load:  " +oReadyState.target.src);
		fCallback(oParams);
	},
	/**
     * Callback loaded when system files are ready
     */
	loadMVC : function(){
		this.logging();
		console.systemLog("conf.global.js loaded")
		if(stackJS.Conf.environement == "production"){
			this.loadProduction();
		}else{
			this.loadLibrary();
			
			// We can't have information about CSS file loading (some browser just don't like it), so i just push them all directly throught here
			if(stackJS.Conf.PluginsCSS){
				for(var i=0; i<stackJS.Conf.PluginsCSS.length; i++){
					this.insertCSSfiles(stackJS.Conf.PluginsCSS[i])	
				}
			}
			
		}
	},
	/**
     *  Augment console.log habilities, enable console.log in old ie versions and correct ie crashing bug, 
     *  can be disabled from conf.global.js
     */
	logging: function(){
		if(this.Conf.logs){
			if (typeof console == "undefined" || typeof console.log == "undefined"){
				if(stackJS.Conf.customIElogs){
					var debugHtml = document.createElement("div");
					debugHtml.setAttribute("style","position:absolute; top:0; left:0; width:100%;height:200px; overflow:scroll;z-index:1000; display:block; filter:alpha(opacity=80); background:#000;");
					debugHtml.setAttribute("id","debugMode")
					document.getElementsByTagName('body')[0].appendChild(debugHtml);
					console ={ log:function(caller){
							var content = document.getElementById("debugMode").innerHTML + "<div style='color:#fff;font-weight:bold;'>"+caller+"</div>"
							document.getElementById("debugMode").innerHTML =content;
						}
					}
					console ={ systemLog:function(caller){
							var content = document.getElementById("debugMode").innerHTML + "<div style='color:#fff;font-weight:bold;'>"+caller+"</div>"
							document.getElementById("debugMode").innerHTML =content;
						}
					}
				}else{
					console ={ log:function(caller){alert(caller)}};
					console ={ systemLog:function(caller){alert(caller)}};
				}
			}else{
				if(this.Conf.systemLogs){
					console.systemLog =  function( context ) { console.log( context) };
				}else{
					console.systemLog =  function(  ) {};
				}
			}
		}else{
			if (typeof console == "undefined" || typeof console.log == "undefined") {
				console = { log: function(loggin) {} };
			}else{
				console.log = function() {}; 	
				console.systemLog =  function(  ) {};
			}	
		}	
	},
	/**
     * Check is object exist
     * @param {Object} object - the object to look into
     * @param {Array} aProps - properties to check
     */
	isset: function(object, props){
		// we will use the dump variable to iterate in the object
		var dump,
			propsLength = props.length -1;
		// loop in the properties 
		for(x=0;x<props.length;x++){
			// first prop?
			if(x == 0) {
				// add the object to dump (object.props1)
				dump = object[props[x]];
				continue;
			}

			// Undefined? return false
			if(!dump || typeof dump == "undefined" || typeof dump[props[x]] == "undefined"){
				return false;
			}else{
				// move in the object level 
				// object.props1.props2
				// object.props1.props2.props3
				dump = dump[props[x]];
				// return true, of even return the object back
				if(x == propsLength) return dump;
			}
		}	
	},
	/**
     *  Load the javascript library of your choice
     */
	loadLibrary: function(){
		console.systemLog("Loading Library " + stackJS.Conf.librarySource);
		
		require([stackJS.Conf.librarySource], function() {
			stackJS.loadPlugins();
		});

	},	
	loadPlugins: function(){
		stackJS.libraryLoad = true; 
		require(stackJS.Conf.Plugins, function() {
			console.systemLog("System ready... loading MVC files");
			stackJS.loadModules()
		});
	},
	/**
     *  Load modules object and configurations files
     */
	loadModules: function(){
		this.loadModulesObjects();
		var sModuleConfigPath = stackJS.Conf.configPath + "conf.modules.js"
		require([sModuleConfigPath], function(e) {
			console.systemLog("conf.modules.js loaded");
			stackJS.confObserver();
		});
	},
	/**
     *  Create base objects for the application
     */
	loadModulesObjects : function(){
		if(typeof(this.Conf.moduleClassNames) == "undefined") this.Conf.moduleClassNames = ['Model',"View","Controller"];	
	
		window[stackJS.Conf.applicationName] = {};
		window[stackJS.Conf.applicationName] = new stackJS.module;
		window[stackJS.Conf.applicationName].Conf = {};
	},		
	confObserver: function(){
		if(stackJS.Conf.loadModules) stackJS.Conf.modules = stackJS.Conf.loadModules;
		for (var i in stackJS.Conf.modules){
			this.moduleLoader(stackJS.Conf.modules[i]);
		}
	},
	moduleLoader : function(module){
		
		if(!window[stackJS.Conf.applicationName]["Conf"][module]) console.systemLog("cannot find configuations for module: " + module)

		var aDependenciesFiles = window[stackJS.Conf.applicationName]["Conf"][module]["dependencies"];
		var aCSSDependenciesFiles = window[stackJS.Conf.applicationName]["Conf"][module]["CSSdependencies"];
		
		if(typeof(aCSSDependenciesFiles) != "undefined"){
			// We can't have information about CSS file loading (some browser just don't like it), so stackJS just push them all directly throught here
			if(aCSSDependenciesFiles){
				for(var i=0; i<aCSSDependenciesFiles.length; i++){
					this.insertCSSfiles(aCSSDependenciesFiles[i])	
				}
			}
		}	
		if(typeof(aDependenciesFiles) != "undefined"){
			this.loadDependencies(aDependenciesFiles,module);
		}else{
			this.loadModuleFiles(module);
		}
	},	
	/**
     *  Add dependencies to he loadplugins array
     *  @param {Array} aDependencies - array from dependencies to load, can be used externally 
     *  @param {String} sModule - Module name   
     */	
	loadDependencies : function(aDependencies,sModule){
		require(aDependencies, function() {
				console.systemLog("dependencies loading complete for " + sModule);
				stackJS.loadModuleFiles(sModule);
		});
	},
	/**
     *  Check if the dependencies are laoded and call the module files loading
     *  @param {String} sModule - Module name        
     */		
	loadModuleFiles : function(sModule){
		var aFilesModule = [];
		
		var aModuleClassNames = window[stackJS.Conf.applicationName]["Conf"][sModule]["moduleClassNames"];
		if(aModuleClassNames){
			var aLoadModuleFiles = aModuleClassNames;
		}else{
			var aLoadModuleFiles = this.Conf.moduleClassNames;
		}

		for(var x in aLoadModuleFiles){		
			var fileUrl = sModule.toLowerCase() + "/" +aLoadModuleFiles[x]+ "." + sModule +  ".js";
			aFilesModule.push(this.Conf.modulePath + fileUrl);
		}
		
		require(aFilesModule, function() {
			console.systemLog("Module ready, instanciating: " + sModule);
			window[stackJS.Conf.applicationName].start(sModule)
		}); 
		/* */
	},	
	/**
	 *  Handle Module instantiations and states
     *  Sandbox core, handle public methods that modules can access    
     */
	module : function() {
		var moduleData = {},
		    destroyData = {};
		/**
	     *  Register modules and add it in a creator object waiting to get instancied
	     *  @param {String} moduleId - Module name 
		 *  @param {String} func - Class name        
	     */
		function register(moduleId, func){
			if(!moduleData[moduleId[0]]){ 
				moduleData[moduleId[0]] = {
			        instance: {},
					creator: [moduleId[1]]
			    };	
				moduleData[moduleId[0]][moduleId[1]] = 	func;
			}else{
				moduleData[moduleId[0]][moduleId[1]] = 	func;
				moduleData[moduleId[0]].creator.push(moduleId[1]);
			}
		}
		/**
	     *  Destroy module instance, it still keep it in the creator;
	     *  @param {String} sModuleToDestroy - Module name  
	     */
		function destroy(sModuleToDestroy){
		    var data = moduleData[sModuleToDestroy];
		    if (data.instance){
		        data.instance = null;
				if (destroyData[sModuleToDestroy]){
					for(var i=0; i< destroyData[sModuleToDestroy].length; i++){
						destroyData[sModuleToDestroy][i]();
					}
				}
		    }
		}
		/**
	     *  Create module instance and load load() function if available in each class module
	     *  @param {String} moduleId - Module name  
	     */
		function start(moduleId){
			for(var i in moduleData[moduleId].creator){
				var moduleSection = moduleData[moduleId].creator[i];
				if(!moduleData[moduleId]["instance"]) moduleData[moduleId]["instance"] = {};
				
			   	moduleData[moduleId]["instance"][moduleSection] = moduleData[moduleId][moduleSection](new stackJS.module.prototype.Api(moduleId));
				if(moduleData[moduleId]["instance"][moduleSection].load)
					moduleData[moduleId]["instance"][moduleSection].load();
			}
		}
		/**
	     *  Start all module, only reference function start()
	     */
		function startAll(){
		    for (var moduleId in moduleData){
		        if (moduleData.hasOwnProperty(moduleId)){
		            start(moduleId);
		        }
		    }
		}
		/**
	     *  Kill all module, only reference function destroy()
	     */
		function killAll(){
		    for (var moduleId in moduleData){
		        if (moduleData.hasOwnProperty(moduleId)){
		            this.kill(moduleId);
		        }
		    }
		}
		/**
	     *  This is the API instancied to all module
		 *  You can add api functionnality here
	     */
		stackJS.module.prototype.Api = function(sModule) {
			return{
				/**
			     *  Enable a module to access other modules if allowed
			     *  @param {Object} oDataCall - Address of the module you cant to call and data you want to pass
			     */
				bridgeCall:function(oDataCall){
					if(this.checkPermission(sModule, oDataCall[0])){
						return moduleData[oDataCall.Class[0]]["instance"][oDataCall.Class[1]][oDataCall.Class[2]](oDataCall.passData);
					}
				},
				/**
			     *  Enable a module to access other module class
			     *  @param {Object} oDataCall - Address of the module you cant to call and data you want to pass
			     */
				callFunction: function(oDataCall){
					if(stackJS.isset(moduleData[sModule],["instance",oDataCall.Class[0],oDataCall.Class[1]])){
						return moduleData[sModule]["instance"][oDataCall.Class[0]][oDataCall.Class[1]](oDataCall.passData);
					}else{
						console.systemLog("Class undefined: " +oDataCall.Class[0] + " " +  oDataCall.Class[1]);
						return false;
					}
				},
				/**
			     *  Enable a module to load another module if allowed
			     *  @param {String} sNewModule - Module name you want to load
			     */
				loadModule : function(sNewModule){
					if(!this.checkPermission(sModule, sNewModule)) return false;
					if(moduleData.hasOwnProperty(sNewModule)){
						console.systemLog("Module already loaded: " + sNewModule);
						if(!moduleData[sNewModule].instance){
							start(sNewModule)
							console.systemLog("Instancing: " + sNewModule);
						}else{
							console.systemLog("Module already instanciated: " + sNewModule);
						}
					}else{
						stackJS.moduleLoader(sNewModule);
						console.systemLog("Loading module: " + sNewModule + " from " + sModule);
					}
					
				}, 
				/**
			     *  Register destroy directive (DOM events or content to destroy)
			     *  @param {Function} fCallback - Other destroy directive you want executed
			     */
				registerDestroy : function(fCallback) {
					if (!destroyData[sModule]) destroyData[sModule] = [];
					destroyData[sModule].push(fCallback)
				},
				/**
			     *  Call the internal function to destroy module
			     *  @param {String} sModuleToDestroy - Name of the module to destroy
			     */
				killModule : function(sModuleToDestroy){
					if(!this.checkPermission(sModule, sModuleToDestroy)) return false;
					if(moduleData.hasOwnProperty(sModuleToDestroy)){
						destroy(sModuleToDestroy)
						console.systemLog("Module killed: " + sModuleToDestroy);
					}else{
						console.systemLog("Module does not exist: " + sModuleToDestroy);
					}
					
				},
				/**
			     *  Check if the module have the permissions to access other specific modules
			     *  @param {String} sModule - Name of the module caller
				 *  @param {String} oDataCall - Object representing the calling module
			     */
				checkPermission : function(sModuleCaller, sModuleCalling){
					if(typeof(window[stackJS.Conf.applicationName]["Conf"][sModuleCaller]["permissions"]) == "undefined"){
						console.systemLog("Access denied to: " + sModuleCalling)
						console.systemLog("No permission set");
						return false;
					}else{
						var sPermisions = window[stackJS.Conf.applicationName]["Conf"][sModuleCaller]["permissions"]
						if(sPermisions == "*"){
							 console.systemLog("Access Granted: " + sModuleCalling);
							return true
						}else{
							if(sModuleCalling in sPermisions) {
								console.systemLog("Access Granted: " + sModuleCalling);
								return true; 	
							}else{
								console.systemLog("Access denied to: " + sModuleCalling)
								console.systemLog("Check your configuration permissions, maybe you should not have access");
								return false;
							}
						}
					}
				}
			}
		}
		
		return{
			destroy:destroy,
			register: register,	
			start: start,
			startAll:startAll,
			killAll: killAll
		}	
	}	
};


stackJS.init();