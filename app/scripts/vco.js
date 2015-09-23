(function(){
	'use strict';

	//<3
	//vanillla code organizr
	function vcoFactory(){
		var mod = {
			fac: {},
			inst: {},
			//setters
			val: function(name, val){
				mod.inst[name] = val;
			},
			set: function(name, factory){
				mod.inst[name] = null;
				mod.fac[name] = factory;
			},
			//getter
			get: function(name){
			//	return (console.log('di-get: '+name),mod.inst[name]) || (mod.inst[name] = mod.make(name));
				return mod.inst[name] || (mod.inst[name] = mod.make(name));
			},

			//maker
			make: function(name){
				var factory = mod.fac[name];
				if (factory){
					console.log('modMake: ' + name);
					return factory();
				}else{
					throw new Error('Factory Not Found!! ' + name);
				}
			}
		};

		return mod;
	}

	window.vcoFactory = vcoFactory;

	window.Vco = vcoFactory();

	console.log(window.Vco);


}());


