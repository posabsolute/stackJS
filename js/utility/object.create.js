/*****************************************************
*	Instantiate global object
*	Creator: Douglas CrockFord
	http://javascript.crockford.com/prototypal.html
******************************************/

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}
