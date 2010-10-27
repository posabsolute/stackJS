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
		this.insertJSfiles({
			path:stackJS.Conf.stackJSpath,
			file:'require.js',
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
			stackJS.confObserver() 
		});
	},
	/**
     *  Create base objects for the application
     */
	loadModulesObjects : function(){
		this.includeType = ['Model',"View","Controller"];
	
		window[stackJS.Conf.applicationName] = {};
		window[stackJS.Conf.applicationName] = new stackJS.module;
		window[stackJS.Conf.applicationName].Conf = {};
	},		
	confObserver: function(){
		for (var i in stackJS.Conf.modules){
			this.moduleLoader(stackJS.Conf.modules[i])
		}
	},
	moduleLoader : function(module){
		if(!window[stackJS.Conf.applicationName]["Conf"][module]) console.systemLog("cannot find configuations for module: " + module)
		
		var aDependenciesFiles = window[stackJS.Conf.applicationName]["Conf"][module]["dependencies"];
		if(typeof(aDependenciesFiles) != "undefined"){
			this.loadDependencies(aDependenciesFiles,module)
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
		var aModuleInclude = window[stackJS.Conf.applicationName]["Conf"][sModule]["moduleInclude"];
		if(aModuleInclude){
			console.log(aModuleInclude)
			var aLoadModuleFiles = window[stackJS.Conf.applicationName]["Conf"][sModule]["moduleInclude"];
		}else{
			var aLoadModuleFiles = this.includeType;
		}
		for(var x in aLoadModuleFiles){		
			var fileUrl = sModule.toLowerCase() + "/" +this.includeType[x]+ "." + sModule +  ".js";
			aFilesModule.push(this.Conf.modulePath + fileUrl);
		}
		require(aFilesModule, function() {
			console.systemLog("Module ready, instanciating: " + sModule);
			window[stackJS.Conf.applicationName].start(sModule)
		}); 
		/* */
	},	
	module : function() {
		var moduleData = {};
		stackJS.module.prototype.Api = function(sModule) {
			return{
				bridgeCall:function(oDataCall){
					if(typeof(window[stackJS.Conf.applicationName]["Conf"][sModule]["permissions"]) == "undefined"){
						console.systemLog("Access denied to: " + oDataCall.Class[0])
						console.systemLog("Check your configuration permissions, maybe you should not do that");
						return false;
					}else{
						var sPermisions = window[stackJS.Conf.applicationName]["Conf"][sModule]["permissions"]
						if(sPermisions == "*"){
							console.systemLog("Accessing: " + oDataCall.Class[0] + " " + oDataCall.Class[1] + " " + oDataCall.Class[2]);
							return moduleData[oDataCall.Class[0]]["instance"][oDataCall.Class[1]][oDataCall.Class[2]](oDataCall.passData);
						}else{
							var bAccess = false;
							for (var i in sPermisions){
								if(sPermisions[i] == oDataCall.Class[0]) {
									return moduleData[oDataCall.Class[0]]["instance"][oDataCall.Class[1]][oDataCall.Class[2]](oDataCall.passData); 	
									break;
								}
								
							}
							if(bAccess == false){
								console.systemLog("Access denied to: " + oDataCall.Class[0])
								console.systemLog("Check your configuration permissions, maybe you should not have access");
							}
							return false;
						}
					}
				},
				callFunction: function(oDataCall){
					//console.log(oDataCall.passData)
					if(typeof(moduleData[sModule]["instance"][oDataCall.Class[0]]) == "undefined"){
						console.systemLog("Module undefined: " +oDataCall.Class[0] + " " +  oDataCall.Class[1]);
						return false;
					}
					if(typeof(moduleData[sModule]["instance"][oDataCall.Class[0]][oDataCall.Class[1]]) == "undefined"){
						console.systemLog("Module undefined: " +oDataCall.Class[0] + " " +  oDataCall.Class[1]);
						return false;
					}
					return moduleData[sModule]["instance"][oDataCall.Class[0]][oDataCall.Class[1]](oDataCall.passData);
				}
			}
		}	
		return{
		
			register: function(moduleId, func){
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
			},	
			start: function(moduleId){
				for(var i in moduleData[moduleId].creator){
					var moduleSection = moduleData[moduleId].creator[i];
					
				   	moduleData[moduleId]["instance"][moduleSection] = moduleData[moduleId][moduleSection](new stackJS.module.prototype.Api(moduleId));
				    if(moduleData[moduleId]["instance"][moduleSection].load)
						moduleData[moduleId]["instance"][moduleSection].load();
				}
			},
		
			kill: function(moduleId){
			    var data = moduleData[moduleId];
			    if (data.instance){
			        data.instance.destroy();
			        data.instance = null;
			    }
			},

			startAll: function(){
			    for (var moduleId in moduleData){
			        if (moduleData.hasOwnProperty(moduleId)){
			            this.start(moduleId);
			        }
			    }
			},
		
			killAll: function(){
			    for (var moduleId in moduleData){
			        if (moduleData.hasOwnProperty(moduleId)){
			            this.stop(moduleId);
			        }
			    }
			}

		}	
	}	
};


stackJS.init(); 