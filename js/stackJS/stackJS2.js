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
		
		this.loadRequireJS();
	},
	 /**
    * Load the require.js library taht will handle files insertion
    */
	loadRequireJS : function(){
		
		var jsSrc  = document.getElementById("stackJS").src;
		var jsQry = jsSrc.substr(jsSrc.indexOf("?")+1)
		var jsQry = jsQry.split("&")

		for(var i in jsQry){
			var addConf = jsQry[i].split("=");
			var addConfParams = addConf[1].split(",")
			window["stackJS"]["configs"][addConf[0]] = addConfParams;
		}
		
		this.insertJSfiles({
			path:this.configs.path + "stackJS/"	,
			file:'require.js',
			callback:function(){stackJS.loadConfiguration();}
		})
	},
 	/**
 	 * Gets the params for the file url
     * Load the global conf files
     */
	loadConfiguration : function(){
		var globalConf = this.configs.path+"stackJS/conf/conf.global.js"
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
		
		require([stackJS.librarySource], function() {
			stackJS.loadPlugins();
		});

	},	
	loadPlugins: function(){
		stackJS.libraryLoad = true; 
		require(stackJS.Plugins, function() {
			console.systemLog("System ready... loading MVC files");
			stackJS.loadModules()
		});
	},
	/**
     *  Load modules object and configurations files
     */
	loadModules: function(){
		this.loadModulesObjects();
		var sModuleConfigPath = stackJS.configPath + "conf.modules.js"
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

		window[stackJS.applicationName] = {};
		window[stackJS.applicationName].Model = {};
		window[stackJS.applicationName].Controller = {};
		window[stackJS.applicationName].View = {};
		window[stackJS.applicationName].Conf = {};
	},		
	confObserver: function(){
		for (var i in stackJS.modules){
			this.moduleLoader(stackJS.modules[i])
		}
	},
	moduleLoader : function(module){

		var aDependenciesFiles = window[stackJS.applicationName]["Conf"][module]["dependencies"];
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
		var aModuleInclude = window[stackJS.applicationName]["Conf"][sModule]["moduleInclude"];
		if(aModuleInclude){
			console.log(aModuleInclude)
			var aLoadModuleFiles = window[stackJS.applicationName]["Conf"][sModule]["moduleInclude"];
		}else{
			var aLoadModuleFiles = this.includeType;
		}
		for(var x in aLoadModuleFiles){		
			var fileUrl = this.includeType[x].toLowerCase() + "s/" +this.includeType[x]+ "." + sModule +  ".js";
			aFilesModule.push(this.configs.path + fileUrl);
		}
		require(aFilesModule, function() {
			console.systemLog("Module ready, instanciating: " + sModule);
			stackJS.loadInstanciations(sModule)
		});
	},	
	/**
     *  Instantiate Model and View into controller for all modules, 
     *  This make possible the use of this.Model, and this.View
     *  load application
     */
	loadInstanciations: function(sModule){

		if(typeof(window[stackJS.applicationName]["Controller"][sModule]) == "undefined"){
			console.systemLog("This module do not exist: "+ sModule);
			return;
		}
		var cacheMapObject = window[stackJS.applicationName]["Controller"][sModule];	
				
		cacheMapObject["prototype"]["Model"] = new window[stackJS.applicationName]["Model"][sModule];	
		cacheMapObject["prototype"]["Model"]["callback"] = function(fresolveMethod, oData){
			cacheMapObject[fresolveMethod](oData);
		}	

		cacheMapObject["prototype"]["View"] = new window[stackJS.applicationName]["View"][sModule];			
		cacheMapObject = new window[stackJS.applicationName]["Controller"][sModule];
	}	
};


(function() { stackJS.init(); })()