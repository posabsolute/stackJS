/**
 * Javascript files and modules loader
 * @author Cedric Dugas
 */


/**
 * Global setup and calls
 * ----------------------------------------------------------------
 */

	stackJS.loadSystem(stackJS.Conf.librarySource);
	stackJS.loadSystem(stackJS.Conf.Plugins);

	stackJS.loadModules([
		"Recipe",
		"Chef"
	]);

/**
 * Page-specific calls,
 *	You could also use a router system for this, like sammy.js
 * ----------------------------------------------------------------
*/

switch (APPCONFIG.page_id) {

  case 'home':
	// load modules for homepage
	
  break;

}