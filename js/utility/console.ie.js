
/*****************************************************
*	Console/log DEBUG 
*	Desc: Stop console from crashing if the browser does not support it
******************************************/

if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function() {} };