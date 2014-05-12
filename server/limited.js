function Queue(size) {
	this.length = size;
	this.arr = [size];
	this.writecounter = 0;
}

Queue.prototype = {
	push : function(obj) {
		this.arr[this.writecounter] = obj;
		this.writecounter = (this.writecounter + 1) % this.length;
	},
	get : function(index) {
		return this.arr[(this.writecounter + index) % this.length];
	}
};

module.exports = Queue;
