(function (Vco) {
	'use strict';
	var assert = window.assert;

	// assert.typeOf(foo, 'string');
	// assert.equal(foo, 'bar');
	// assert.lengthOf(foo, 3)
	// assert.property(tea, 'flavors');
	// assert.lengthOf(tea.flavors, 3);

	describe('Vanialla Code Organiser', function () {
		describe('start module, add modules and valuess', function () {
			it('should have public apis', function () {
				var vocFactory = window.vcoFactory;
				var vco = vocFactory();
				assert.typeOf(vco.get, 'function');
				assert.typeOf(vco.set, 'function');
			});
			it('should add mod', function(){
				Vco.set('mod.abc', function(){

					return {
						abc: 'def'
					};
				});

				var abc = Vco.get('mod.abc');
				assert(abc.abc === 'def');
			});
			it('should add val', function(){
				Vco.val('val.def', {
					def: 'hij'
				});

				var def = Vco.get('val.def');
				assert(def.def === 'hij');
			});
		});
	});

	describe('DoublyLinkedList', function(){

		it('should push object item', function(){
			var DoublyLinkedList = Vco.get('DoublyLinkedList');
			var stack = new DoublyLinkedList();

			stack.push({
				abc: 'def'
			});
			assert(stack.length === 1);
			stack.push({
				def: 'hij'
			});
			assert(stack.length === 2);
		});

		it('should pop object item', function(){
			var DoublyLinkedList = Vco.get('DoublyLinkedList');
			var stack = new DoublyLinkedList();

			stack.push({
				abc: 'abc'
			});
			assert(stack.length === 1);

			stack.push({
				def: 'def'
			});
			assert(stack.length === 2);

			var def = stack.pop();
			assert(def.def === 'def');
			assert(stack.length === 1);
		});

		it('should shift object item', function(){
			var DoublyLinkedList = Vco.get('DoublyLinkedList');
			var stack = new DoublyLinkedList();

			stack.push({
				abc: 'abc'
			});
			assert(stack.length === 1);

			stack.push({
				def: 'def'
			});
			assert(stack.length === 2);

			var abc = stack.shift();
			assert(abc.abc === 'abc');
			assert(stack.length === 1);
		});

		it('should empty items', function(){
			var DoublyLinkedList = Vco.get('DoublyLinkedList');
			var stack = new DoublyLinkedList();

			stack.push({
				abc: 'abc'
			});
			assert(stack.length === 1);

			stack.push({
				def: 'def'
			});
			assert(stack.length === 2);

			stack.empty();
			assert(stack.length === 0);
		});
	});

	describe('Simple Pool', function(){

		// it('should push object item', function(){
		// 	var SimplePool = Vco.get('SimplePool');
		// 	var pool = new SimplePool();

		// });

		it('should prep item', function(){
			var SimplePool = Vco.get('SimplePool');
			var pool = new SimplePool();
			pool.factory = function(){
				return {
					tar: 0
				};
			};
			pool.reseter = function(obj){
				obj.tar = 0;
			};
			pool.prep(3);

			assert(pool.freeStack.length === 3);
		});

		it('should use item', function(){
			var SimplePool = Vco.get('SimplePool');
			var pool = new SimplePool();
			pool.factory = function(){
				return {
					tar: 0
				};
			};
			pool.reseter = function(obj){
				obj.tar = 0;
			};
			pool.prep(3);

			assert(pool.freeStack.length === 3);

			var tar1 = pool.alloc();
			assert(pool.freeStack.length === 2);
			assert(tar1.tar === 0);

			tar1.tar = 1;

			var tar2 = pool.alloc();
			assert(pool.freeStack.length === 1);
			assert(tar2.tar === 0);

		});

		it('should re-use item', function(){
			var SimplePool = Vco.get('SimplePool');
			var pool = new SimplePool();
			pool.factory = function(){
				return {
					tar: 0
				};
			};
			pool.reseter = function(obj){
				obj.tar = 0;
			};
			pool.prep(3);

			assert(pool.freeStack.length === 3);

			var tar1 = pool.alloc();
			assert(pool.freeStack.length === 2);

			var tar2 = pool.alloc();
			assert(pool.freeStack.length === 1);

			var tar3 = pool.alloc();
			assert(pool.freeStack.length === 0);

			//reuse
			pool.free(tar2);
			assert(pool.freeStack.length === 1);

			pool.free(tar1);
			assert(pool.freeStack.length === 2);

			pool.free(tar3);
			assert(pool.freeStack.length === 3);

		});

	});

	describe('FrameBudgetTaskManager', function(){

		it('should add task', function(){
			var FrameBudgetTaskManager = Vco.get('FrameBudgetTaskManager');
			var fbtm = new FrameBudgetTaskManager();
			var state = {
				index: 0
			};
			var task = function(){
				state.index++;
			};
			fbtm.addTask(state, task);
			fbtm.addTask(state, task);
			fbtm.addTask(state, task);

			var now = window.performance.now();
			fbtm.stepTask(now);

			assert(state.index === 3);

		});

		it('should digest task', function(done){
			var FrameBudgetTaskManager = Vco.get('FrameBudgetTaskManager');
			var fbtm = new FrameBudgetTaskManager();
			var state = {
				index: 0
			};
			var task = function(){
				setTimeout(function(){
					state.index++;
				}, 0);
			};
			fbtm.addTask(state, task);
			fbtm.addTask(state, task);
			fbtm.addTask(state, task);

			var now = window.performance.now();
			fbtm.digest(now);

			setTimeout(function(){
				assert(state.index === 3);
				done();
			}, 100);

		});


	});









})(window.Vco);
