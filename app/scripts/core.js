(function(Vco){
	'use strict';

	Vco.set('DoublyLinkedList', function(){

		//https://github.com/mschwartz/SilkJS
		function DoublyLinkedList() {
			this.nextObject = this;
			this.prevObject = this;
			this.length = 0;
		}
		DoublyLinkedList.prototype = {
			constructor: DoublyLinkedList,
			//addHead: function(o) {
			unshift: function(o) {
				this.length++;
				this.append(o, this);
			},

			//addTail: function(o) {
			push: function(o) {
				this.length++;
				this.append(o, this.prevObject);
			},

			//remHead: function() {
			shift: function() {
				this.length--;
				return this.nextObject === this ? false : this.remove(this.nextObject);
			},

			//remTail: function() {
			pop: function() {
				this.length--;
				return this.prevObject === this ? false : this.remove(this.prevObject);
			},
			append: function(node, after) {
				node.nextObject = after.nextObject;
				node.prevObject = after;
				after.nextObject.prevObject = node;
				after.nextObject = node;
			},
			remove: function(node) {
				node.nextObject.prevObject = node.prevObject;
				node.prevObject.nextObject = node.nextObject;
				return node;
			},
			each: function(fn) {
				for (
					var node = this.nextObject;
					node !== this;
					node = node.nextObject
				) {
					fn(node);
				}
			},
			empty: function() {
				this.length = 0;

				return this.nextObject === this;
			}
		};

		return DoublyLinkedList;
	});



	Vco.set('SimplePool', function (){
		var DoublyLinkedList = Vco.get('DoublyLinkedList');

		function SimplePool(){
			this.useCount = 0;

			this.freeStack = new DoublyLinkedList();
		}
		SimplePool.prototype = {
			// constructor: SimplePool,
			//public
			reseter: function(o){ console.log('reseter not ready!', o); },
			//public
			factory: function(){ console.log('factory not ready!'); },
			make: function(){
				//console.log('plmk:',this.factory.toString());
				return this.factory();
			},
			makeFree: function(){
				this.freeStack.push(this.make());
			},
			getFree: function(){
				return this.freeStack.shift();
			},
			prep: function(num){
				for (var i = 0; i < num; i++) {
					this.makeFree();
				}
			},

			//public
			alloc: function(){
				var obj = this.getFree();

				if (!obj){
					this.makeFree();
					obj = this.getFree();
				}

				this.reseter(obj);

				this.useCount++;
				return obj;
			},
			//public
			free: function(obj){

				this.reseter(obj);

				this.freeStack.push(obj);
				this.useCount--;
			}
		};

		return SimplePool;
	});


	Vco.set('FrameBudgetTaskManager', function(){
		var DoublyLinkedList = Vco.get('DoublyLinkedList');
		var SimplePool = Vco.get('SimplePool');

		function Task(){
			this.fn = null;
			this.ctx = null;
			this.data = null;
			this.args = null;

		}
		Task.prototype.reset = function(o){
			this.fn = null;
			this.ctx = null;
			this.data = null;
			this.args = null;

			return o;
		};

		//framebudget task manager
		function FrameBudgetTaskManger(){
			var self = this;
			this.frameBudget = 3;//6ms can do a lot ...

			this.state = {
				finished: false
			};
			this.prebind = {
				digest: self.digest.bind(self)
			};

			//do task
			var stack = new DoublyLinkedList();
			this.stack = stack;

			// this.stack = [];

			//prep taks pool
			var pool = new SimplePool();
			pool.factory = function(){
				return new Task();
			};
			pool.reseter = Task.prototype.reset;
			pool.prep(3);

			this.pool = pool;
		}

		FrameBudgetTaskManger.prototype = {
			constructor: FrameBudgetTaskManger,
			updateFrameBudget: function(frameBudget){
				this.frameBudget = frameBudget;
			},
			addTask: function(ctx, fn, data, args){

				var task = this.pool.alloc();

				task.fn = fn;
				task.data = data;
				task.ctx = ctx;
				task.args = args;

				this.stack.push(task);
				this.state.finished = false;
			},
			stepTask: function(frameStartTime){
				this.taskStepper(this.stack, frameStartTime, this.frameBudget);
			},
			taskStepper: function(stack, fStartTime, budget){
				if (stack.length === 0){
					return;
				}
				var perf = window.performance;
				var todo;
				var timeLeft;
				do {
					todo = stack.shift();
					if (
						typeof todo !== 'undefined' &&
						typeof todo.fn === 'function'
					){
						if (typeof todo.args !== 'undefined'){
							todo.fn.apply(todo.ctx, todo.args);
						}else{
							todo.fn.call(todo.ctx, todo.data);
						}
					}
					timeLeft = (perf.now() - fStartTime);
					this.pool.free(todo);
				} while (
					stack.length > 0 &&
					(timeLeft < budget)
				);
			},
			checkFinish: function(){
				var ans = (this.stack.length === 0);
				if (ans){
					this.state.finished = true;
				}
				return ans;
			},
			digest: function (cTime){
				this.stepTask( cTime || window.performance.now() || Date.now() );
				if (!this.state.finished && !this.checkFinish()){
					window.requestAnimationFrame(this.prebind.digest);
				}
			}
		};

		return FrameBudgetTaskManger;
	});

	Vco.set('Clock', function(){

		function Clock(){
			var self = this;
			self.lastTime = 0; //last time.
			self.cTime = 0; //now
			self.eTime = 0; //elapsted time 16~17
			self.sTime = 0; //stepping time
		}
		Clock.prototype = {
			constructor: Clock,
			now: function(cTime){
				var time = cTime || window.performance.now() || Date.now() || new Date().getTime();
				return time;
			},
			updateTime: function(cTime){
				this.cTime = this.now(cTime);
				if (this.lastTime !== 0) {
					var elapsed = this.cTime - this.lastTime;
					this.eTime = elapsed;
					this.lastTime = this.cTime;
					this.sTime = this.sTime + 0.01;
					return elapsed;
				}

				this.lastTime = this.cTime;
				this.eTime = false;
				return false;
			},
			resetTime: function(){
				this.lastTime = 0;
				this.sTime = 0;
			}
		};

		return Clock;
	});

	Vco.set('mod.clock', function(){
		var Clock = Vco.get('Clock');
		var clock = new Clock();
		return clock;
	});

	Vco.set('mod.fbtm', function(){
		var FrameBudgetTaskManager = Vco.get('FrameBudgetTaskManager');
		var fbtm = new FrameBudgetTaskManager();
		return fbtm;
	});


	Vco.set('mod.loop', function (){
		var render = function noop(){ console.log('haven"t add render function'); };

		var fbtm = Vco.get('mod.fbtm');
		var clock = Vco.get('mod.clock');

		var timerID = 0;
		var busy = false;

		function loop(fsTime){
			if (timerID === null){ return; }
			timerID = window.requestAnimationFrame(loop);

			clock.updateTime(fsTime);

			render(fsTime);

			fbtm.stepTask(fsTime);

			busy = false;
		}

		function start(){
			console.log('STARTING...');
			if (!busy){
				busy = true;
				timerID = window.requestAnimationFrame(loop);
			}
		}
		function stop(){
			console.log('STOPPING...');
			window.cancelAnimationFrame(timerID);
			timerID = null;
		}

		function setRender(newRender){
			render = newRender;
		}

		return {
			start: start,
			stop: stop,
			setRender: setRender
		};
	});


}(window.Vco));


