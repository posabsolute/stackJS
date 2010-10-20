/**
 * stackJS is a small framework to consolidate your javascript architecture
 * @author Cedric Dugas
 */
 
var stackJS = {
	 /**
     * Start Loading file configurations 
     */
	init: function(){
		this.PluginLoaded = [];
		this.modulesLoaded = [];
		this.libraryLoad = false;
		this.configs = {};
		
		this.loadConfiguration();
	},
 	/**
 	 * Gets the params for the file url
     * Load the global conf files
     */
	loadConfiguration : function(){
		var jsSrc  = document.getElementById("stackJS").src;
		var jsQry = jsSrc.substr(jsSrc.indexOf("?")+1)
		var jsQry = jsQry.split("&")

		for(var i in jsQry){
			var addConf = jsQry[i].split("=");
			var addConfParams = addConf[1].split(",")
			window["stackJS"]["configs"][addConf[0]] = addConfParams;
		}	
		this.jspathConf = this.configs.path + "stackJS/conf/"	
	
		this.insertJSfiles({
			path:this.jspathConf,
			file:'conf.global.js',
			callback:function(){stackJS.loadMVC();}
		})
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
		
		if(stackJS.environement == "production"){
			this.loadLProduction();
		}else{
			this.loadLibrary();
		}
		
	},
	/**
     *  Augment console.log habilities, enable console.log in old ie versions and correct ie crashing bug, 
     *  can be disabled from conf.global.js
     */
	logging: function(){
		if(this.logs){
			if (typeof console == "undefined" || typeof console.log == "undefined"){
				if(stackJS.CustomIElogs){
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
				if(this.systemLogs){
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
				console = { systemLog: function() {} };
			}	
		}	
	},
	/**
     *  Load the javascript library of your choice
     */
	loadLibrary: function(){
		console.systemLog("Loading Library " + stackJS.librarySource);
		this.insertJSfiles({
			path:"",
			file:stackJS.librarySource,
			callback:function(){ stackJS.loadPlugins(); }
		})
	},	
	loadPlugins: function(){
		stackJS.libraryLoad = true; 
		for (var i in stackJS.Plugins){
			console.systemLog("Loading plugin " + stackJS.pluginPath + stackJS.Plugins[i]);
			//var callbackPlugin =
			this.insertJSfiles({
				path:"",
				file:stackJS.Plugins[i],
				callback:function(oParams){ stackJS.ObserverInsertPlugins(oParams) }
			},{"pluginName": stackJS.Plugins[i]})
		}
	},
	/**
     * Callback loaded when plugin files are loaded into the head 
     * @param {String} sPluginsFile - PLugin file name, to be added to the loaded array      
     */
	ObserverInsertPlugins : function (oParams){
		stackJS.PluginLoaded.push(oParams.pluginName);
		if(stackJS.libraryLoad && stackJS.PluginLoaded.length == stackJS.Plugins.length){
			console.systemLog("System ready... loading MVC files");
			this.loadModules();
		}
	},	
	/**
     *  Load modules object and configurations files
     */
	loadModules: function(){
		this.loadModulesObjects();
		this.insertJSfiles({
			path:stackJS.configPath,
			file: "conf.modules.js",
			callback:function(){ stackJS.confObserver() }
		})
	},	
	confObserver: function(){
		for (var i in stackJS.modules){
			this.moduleLoader(stackJS.modules[i])
		}
	},
	moduleLoader : function(module){
		console.systemLog("Modules Configuration loaded");
		if(typeof(window[stackJS.applicationName]["Conf"][module]["jsModulePath"]) != "undefined"){
			var sModulePath = window[stackJS.applicationName]["Conf"][module]["jsModulePath"];
		}else{
			var sModulePath = this.configs.path;
		}
		var aDependenciesFiles = window[stackJS.applicationName]["Conf"][module]["dependencies"];
		if(typeof(aDependenciesFiles) != "undefined"){
			this.loadDependencies(aDependenciesFiles,module, sModulePath)
		}else{
			this.loadModuleFiles(module);
		}
	},	
	/**
     *  Add dependencies to he loadplugins array
     *  @param {Array} aDependencies - array from dependencies to load, can be used externally 
     *  @param {String} sModule - Module name   
     */	
	loadDependencies : function(aDependencies,sModule, sModulePath){
		var addinlist = true;
		for (var i in aDependencies){
			for(var x in stackJS.Plugins){
				if (aDependencies[i] == stackJS.Plugins[x])	addinlist = false;
			}
			if(addinlist) {
				stackJS.Plugins.push(aDependencies[i])
				console.systemLog("Adding dependency to list: " + aDependencies[i])
			}
			addinlist = true;
		}
		this.insertDependencies(sModule)
	},
	/**
     *  insert js plugin into the document head
     *  @param {String} sModule - Module name        
     */	
	insertDependencies : function(sModule){

		var addinlist = true;
		var noDependencyLoaded = true;
		
		if(typeof(window[stackJS.applicationName]["Conf"][sModule]["jsPath"]) != "undefined"){
			sModuleFilesPath = window[stackJS.applicationName]["Conf"][sModule]["jsPath"];
		}else{
			sModuleFilesPath = stackJS.pluginPath;
		}
		
		for (var i in stackJS.Plugins){
			for(var x in stackJS.PluginLoaded){
				if (stackJS.PluginLoaded[x] == stackJS.Plugins[i]){
					// console.systemLog("this module is already loaded: " + stackJS.PluginLoaded[x] )
					addinlist = false;		
				}
			} 
			if(addinlist){
				noDependencyLoaded = false;
				var oParams = {
					"pluginName": stackJS.Plugins[i],
					"currentModule": sModule
				}
				this.insertJSfiles({
					path:sModuleFilesPath,
					file:stackJS.Plugins[i],
					callback:function(oParams){ stackJS.observerDependencies(oParams)} 
				}, oParams);
			}
			addinlist = true;
		}
		if(noDependencyLoaded)	stackJS.observerDependencies(false,sModule);		
	},
	/**
     *  Check if the dependencies are loaded and call the module files loading
     *  @param {Object} oParams - paramters given by insertDependencies        
     */		
	observerDependencies: function(oParams){
		if(oParams.pluginName){
			stackJS.PluginLoaded.push(oParams.pluginName);
			console.systemLog("dependency loaded :"+ oParams.pluginName);
		}
		if(stackJS.PluginLoaded.length == stackJS.Plugins.length){
			console.systemLog("dependencies loading complete");
			this.loadModuleFiles(oParams.currentModule);
		}				
	},
	/**
     *  Check if the dependencies are laoded and call the module files loading
     *  @param {String} sModule - Module name        
     */		
	loadModuleFiles : function(sModule){
			for(var x in this.includeType){		
				var fileUrl = this.includeType[x].toLowerCase() + "s/" +this.includeType[x]+ "." + sModule +  ".js";
				this.insertJSfiles({
					path:this.configs.path,
					file:fileUrl,
					callback:function(sModule){ stackJS.ObserverMVC(sModule)} 
				}, sModule)
			}
	},
	/**
     * Callback loaded when MVC files are loaded into the head 
     * @param {String} sModules - Module file name, to be added to the loaded array           
     */
	ObserverMVC : function (sModules){
		stackJS.modulesLoaded.push(sModules);
		var iloadMVCfilesLength = stackJS.modules.length *3;
		if(stackJS.modulesLoaded.length == iloadMVCfilesLength){
			console.systemLog("MVC files Ready, loading defered scripts and instantiating");
			this.loadInstanciations();
		};
	},	
	/**
     *  Create base objects for the application
     */
	loadModulesObjects : function(){
		this.includeType = ['Model',"View","Controller"];

		window[stackJS.applicationName] = {};
		window[stackJS.applicationName].Model = {};
		window[stackJS.applicationName].Controller = {};
		window[stackJS.applicationName].View = {};
		window[stackJS.applicationName].Conf = {};
	},
	/**
     *  Instantiate Model and View into controller for all modules, 
     *  This make possible the use of this.Model, and this.View
     *  load application
     */
	loadInstanciations: function(){

		for(var x in stackJS.modules){
			console.systemLog("Loading module: " + stackJS.modules[x]);
			if(typeof(window[stackJS.applicationName]["Controller"][stackJS.modules[x]]) == "undefined"){
				console.systemLog("This module do not exist: "+ stackJS.modules[x]);
				break;
			}
			var cacheMapObject = window[stackJS.applicationName]["Controller"][stackJS.modules[x]];	
					
			cacheMapObject["prototype"]["Model"] = new window[stackJS.applicationName]["Model"][stackJS.modules[x]];	
			cacheMapObject["prototype"]["Model"]["callback"] = function(fresolveMethod, oData){
				cacheMapObject[fresolveMethod](oData);
			}	

			cacheMapObject["prototype"]["View"] = new window[stackJS.applicationName]["View"][stackJS.modules[x]];			
			cacheMapObject = new window[stackJS.applicationName]["Controller"][stackJS.modules[x]];
		}
		console.systemLog("Application Loaded")
	}
};


(function() { stackJS.init(); })()
	
	

