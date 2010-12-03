/**
 * @license RequireJS Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*
 * This file patches require.js to communicate with the build system.
 */

/*jslint nomen: false, plusplus: false, regexp: false */
/*global load: false, require: false, logger: false, setTimeout: true,
 pragma: false, Packages: false, parse: false, java: true */
"use strict";

(function () {
    var layer,
        lineSeparator = java.lang.System.getProperty("line.separator"),
        oldDef;

    //A file read function that can deal with BOMs
    function _readFile(path, encoding) {
        encoding = encoding || "utf-8";
        var file = new java.io.File(path),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                stringBuffer, line;
        try {
            stringBuffer = new java.lang.StringBuffer();
            line = input.readLine();
    
            // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
            // http://www.unicode.org/faq/utf_bom.html
            
            // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
            // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
            if (line && line.length() && line.charAt(0) === 0xfeff) {
                // Eat the BOM, since we've already found the encoding on this file,
                // and we plan to concatenating this buffer with others; the BOM should
                // only appear at the top of a file.
                line = line.substring(1);
            }
            while (line !== null) {
                stringBuffer.append(line);
                stringBuffer.append(lineSeparator);
                line = input.readLine();
            }
            //Make sure we return a JavaScript string and not a Java string.
            return String(stringBuffer.toString()); //String
        } finally {
            input.close();
        }
    }

    /** Reset state for each build layer pass. */
    require._buildReset = function () {
        //Clear up the existing context.
        delete require.s.contexts[require.s.ctxName];

        //These variables are not contextName-aware since the build should
        //only have one context.
        layer = require._layer = {
            buildPathMap: {},
            buildFileToModule: {},
            buildFilePaths: [],
            loadedFiles: {},
            modulesWithNames: {},
            existingRequireUrl: ""
        };
    };

    require._buildReset();

    /**
     * Makes sure the URL is something that can be supported by the
     * optimization tool.
     * @param {String} url
     * @returns {Boolean}
     */
    require._isSupportedBuildUrl = function (url) {
        //Ignore URLs with protocols or question marks, means either network
        //access is needed to fetch it or it is too dynamic. Note that
        //on Windows, full paths are used for some urls, which include
        //the drive, like c:/something, so need to test for something other
        //than just a colon.
        return url.indexOf("://") === -1 && url.indexOf("?") === -1;
    };

    //Override require.def to catch modules that just define an object, so that
    //a dummy require.def call is not put in the build file for them. They do
    //not end up getting defined via require.execCb, so we need to catch them
    //at the require.def call.
    oldDef = require.def;

    //This function signature does not have to be exact, just match what we
    //are looking for.
    define = require.def = function (name, obj) {
        if (typeof name === "string" && !require.isArray(obj) && !require.isFunction(obj)) {
            layer.modulesWithNames[name] = true;
        }
        return oldDef.apply(require, arguments);
    };

    //Override load so that the file paths can be collected.
    require.load = function (moduleName, contextName) {
        /*jslint evil: true */
        var url = require.nameToUrl(moduleName, null, contextName), map,
            contents,
            context = require.s.contexts[contextName];
        context.loaded[moduleName] = false;

        //Only handle urls that can be inlined, so that means avoiding some
        //URLs like ones that require network access or may be too dynamic,
        //like JSONP
        if (require._isSupportedBuildUrl(url)) {
            //Save the module name to path mapping.
            map = layer.buildPathMap[moduleName] = url;
    
            //Load the file contents, process for conditionals, then
            //evaluate it.
            contents = _readFile(url);
            contents = pragma.process(url, contents, context.config);
    
            //Find out if the file contains a require() definition. Need to know
            //this so we can inject plugins right after it, but before they are needed,
            //and to make sure this file is first, so that require.def calls work.
            //This situation mainly occurs when the build is done on top of the output
            //of another build, where the first build may include require somewhere in it.
            if (!layer.existingRequireUrl && parse.definesRequire(url, contents)) {
                layer.existingRequireUrl = url;
            }
    
            //Only eval complete contents if asked, or if it is a require extension.
            //Otherwise, treat the module as not safe for execution and parse out
            //the require calls.
            if (!context.config.execModules && moduleName !== "require/text" && moduleName !== "require/i18n") {
                //Only find the require parts with [] dependencies and
                //evaluate those. This path is useful when the code
                //does not follow the strict require pattern of wrapping all
                //code in a require callback.
                contents = parse(url, contents);
            }
    
            if (contents) {
                eval(contents);

                //Support anonymous modules.
                require.completeLoad(moduleName, context);
            }
        }

        //Mark the module loaded.
        context.loaded[moduleName] = true;
        require.checkLoaded(contextName);
    };

    //Override a method provided by require/text.js for loading text files as
    //dependencies.
    require.fetchText = function (url, callback) {
        callback(_readFile(url));
    };

    //Marks the module as part of the loaded set, and puts
    //it in the right position for output in the build layer,
    //since require() already did the dependency checks and should have
    //called this method already for those dependencies.
    require.execCb = function (name, cb, args) {
        var url = name && layer.buildPathMap[name];
        if (url && !layer.loadedFiles[url]) {
            layer.buildFilePaths.push(url);
            layer.loadedFiles[url] = true;
            layer.modulesWithNames[name] = true;
        }
    };
}());
