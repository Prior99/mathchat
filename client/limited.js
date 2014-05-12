function Queue(size) {
	this.size = size;
	this.arr = [size];
	this.writecounter = 0;
}

Queue.prototype = {
	push : function(obj) {
		this.writecounter = (this.writecounter + 1) % this.size;
	},
	git : function(index) {
		return this.arr[(this.writecounter + index) % this.size];
	}
};

module.exports = Queue;
