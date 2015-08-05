

Object.prototype.remove = function (key) {
   if (!this.hasOwnProperty(key))
      return
   if (isNaN(parseInt(key)) || !(this instanceof Array))
      delete this[key]
   else
      this.splice(key, 1)

	return this;
};

Array.prototype.contains = function(obj){
	return this.indexOf(obj)>-1;
};

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

Array.prototype.remove = function(index){
	this.splice(index,1);
	return this;
};
