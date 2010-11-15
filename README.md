
stackJS beta 0.5


Reference:

1.Basic

2.Getting Started

2.1 Configurations

2.2 Using the framework

2.3 Registering Modules

2.4 Working with the api

3.Conventions



# 1. Basic
What is stackJS?
stackJS is a small javascript framework that try to not get in your way while still giving you tools to write good and maintainable code. It aims at moving the front-end logic from the back-end to the front-end

## Modules
A module is an independent unit of functionality on the page that is comprised of business logic and most often some UI. For this reason, it helps to think of modules as a combination of HTML, CSS, and JavaScript that represents a single part of the page. 

## Sandbox (api)
When a module needs to communicate or interact outside of its particular area, it must request permission to do so. The sandbox object is a module's view into the outside world, and serves to keep the module loosely-coupled. By limiting the module's direct knowledge of other objects to just one, it's easy to remove the module or move it to another page. You can think of the sandbox object as a security guard to prevent the module from doing things it shouldn't.

Theoretically, the sandbox is the only part of your application that have access to all modules. When you work in a module, you can't access anything from the application without passing by the api, and the api won't let you call other modules, you can however call anything within any files your module is controlling.


## What Library stackJS uses?
None, you can use any library (even your own) with it, it use requireJS to handle the dependencies. 
In fact it also play well with php MVC frameworks.

## Can you load more than one application at the same time?
No, not currently.


# 2. Getting started

Look at the file structure of the provided example. Open "js" then "modules", also open "stackJS" then "conf". 
stackJS takes for granted that modules has their own folder and follow a simple file name structure.
/moduleName/moduleName.Class.js

## Files names
stackJS use the class names Model, View, Controller but this is not by default. You could name them Mediators, ajax or anything else. The class names can be configured in the configuration files, both globally and  per module.

in conf.global.js - you can use the StacJS.moduleClassNames to define those giving an array.
in conf.modules.js - You can overwrite StacJS.moduleClassNames per module using : Conf.ModuleName.moduleClassNames 


# 2.1 Configurations
stackJS relies on configuration files to understand your app. 
You have one base configuration files and one for your modules.

## js/stackJS/conf/conf.global.js
This file is the base configuration for your app.

    (function() {
        stackJS.environement = "developement";   // environement variable, developement or production 
        
        /* Load logs, CustomIElogs makes logs appears in a overflown div if the console is undefined */
        stackJS.logs = true;
        stackJS.CustomIElogs = true;
        stackJS.systemLogs = true;
        
        /* 	Enable Unit test, (not working for now)
        	you can test each models separatly  or all using "*"  */
        stackJS.test = false;
        stackJS.includeTest = [];
        
        /* Aplication path and name */
        stackJS.pluginPath = 'js/utility/'; 	// where are your plugin
        stackJS.applicationName = "Cooking";	// Your application name
        
        stackJS.librarySource = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';	// Using a library? will be loaded first
        /* Load all your plugins dependencies here, they are loaded asynch for now */
        stackJS.Plugins = ['serializeObject.js','jquery.fixture.js'];
        stackJS.pluginsLoadAsynch = true;  // load all plugins asynch, without any particular order
        
        // Internal framework Files
        stackJS.loadFiles = [];	
        
        stackJS.modules = ["Recipe"] // load this modules, can be overwrited by loadModules in the html
    })()

## js/stackJS/conf/conf.modules.js

Every module can dictate plugin dependencies before the module is loaded.
You can also tell a different path to your module js files (can be useful when your js files are located in each modules folder of your php framework)


Example:

    /* RECIPE CONFIG */
    Cooking.Conf.Recipe = {
         "moduleClassNames":["Model", "Controller", "View"],
         "modulePathJS":"js/module/chef/",
         "permissions":["chef"],		
         "dependencies":['js/utility/jquery.easing.1.3.js']
    }

* permissions take "*" or an array of module name as parameter, it enable you to call other modules
* moduleClassNames are the file Class you want to add, you need to follow this pattern in the filename : ModuleName.Class.js 


# 2.2 Using the framework

The framework should help you separate your javascript logic. You can refer to the recipe CRUD example provided with the framework.Personally I use something like this:

Model:
This is where your handle all your ajax calls, send and receive information form the server

Controller: 
This is where you write all your code. Beside creating html string and templating engine.

View:
This is where your create your html strings that are returned to your controller to be added in the DOM.
There will be no templating engine provided, I think it's your job to figure out what best work for you in that part.

# 2.3 Registering Modules

You create new Class using the following structure:

    Cooking.register(["Chef","Controller"], function(api) {
        // your code	
    })

This Class would be in the file Chef.Controller.js


# 2.4 Working With the api

## Initiation:
Once your module has been loaded, it will automatically execute the load function if available. This is where you should bind your events and observer.
There is no observer pattern provided as most js libraries have some form of custom events that allows the same thing.
An example:

    Cooking.register(["Chef","Controller"], function(api) {
        return {
            /**
            * When the page loads, gets all recipes to be displayed.
            */
            load: function(){
                var _this = this;
                $("#addRecipeForm").bind(	"submit", 	function(){ _this.onFormAddRecipeSubmit(this);	 	return false; });
                $(".destroyRecipe").live(	"click", 	function(){ _this.onDestroyRecipeClick(this); 		return false; }); 
            }
        }
    })	
	
In the case up here, I need to cache the Controller object doing var _this = this; because once we are in a jquery Event callback function, "this" will always refer to the DOM object that triggered it. This is why you can't just do : $("form#addRecipeForm").live("submit", this.onFormAddRecipeSubmit). We also add the DOM element as a parameter, so you can have access to the DOM object that called the function.



## Calling other public functions :
To call another function within your module you need to use the callFunction method of the api, an example:

    api.callFunction({
        class:["Model",'getRecipe'],
        passData:{callback:["Controller",'listRecipe']} 
    })

You use Class to tell the class and method to call, and passData to pass data to ther function called. 



## Call to other modules:

    api.bridgeCall({
	    module:["Recipe","Controller",'getRecipe'],
	    passData:{callback:["Controller",'listChef']} 
    })

## Loading Modules

You can load other module on the fly in your application with their dependencies using the command below,

    api.loadModule("moduleName", function(){ callBack() })


## killing Modules

You can kill module using this method,

    api.killModule("moduleName")

### Deleting events and others when killing module

If you are going to kill a module, you will probably want to destroy some events and html at the same time. As this too custom for being automated stackJS proposed you to register on module load what you want to delete and it will automatically do it when you kill the module. Example:

    api.registerDestroy(function (){
        $(".destroyRecipe").die();
        $("#addRecipeForm").unbind();
        $("#recipeList").html("");
    })


# 3. Conventions
stackJS have big hopes that you will follow some simple conventions to make code development and maintenance easier.

## Variable names:
Javascript do not in-force variable type, this is why stackJS recommend that you use the type as the first letter of your variables names.

### Examples:
sString
oObject(json)
fFunction
iInteger

## Event names:
In javascript, we rely a lot on events linked to DOM nodes, this is why having a good policy in this domain help to understand what the events are actually doing.
In a general way, it is recommended to follow those patterns:

    [on][Event][Action]
    [on][Event][Dispatcher]
    [on][Dispatcher][Event]
    [on][Id][Event][Handler]


## Comments:
stackJS do not in-force any particular form of commenting as this changes a lot from team to team. 
However, I advocate giving a good description of each method and applying ownership.  Example:

    /**
     * Responds to the create form being submitted by creating a new Recipe.
     * @param {jQuery} el A jQuery wrapped element.
     * @author Cedric Dugas
     */

Using this pattern will also unable you to use a tool like yuidoc later.


