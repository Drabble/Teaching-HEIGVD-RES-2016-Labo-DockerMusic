function Mammal(name){ 
	this.name=name;
	this.offspring=[];
} 
Mammal.prototype.haveABaby=function(){ 
	var newBaby=new Mammal("Baby "+this.name);
	this.offspring.push(newBaby);
	return newBaby;
} 
Mammal.prototype.toString=function(){ 
	return '[Mammal "'+this.name+'"]';
} 


Cat.prototype = new Mammal();        // Here's where the inheritance occurs 
Cat.prototype.constructor=Cat;       // Otherwise instances of Cat would have a constructor of Mammal 
function Cat(name){ 
	this.name=name;
} 
Cat.prototype.toString=function(){ 
	return '[Cat "'+this.name+'"]';
} 