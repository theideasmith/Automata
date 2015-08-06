(function(root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(root);
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory(root));
    } else {
        // Browser globals
        root.Promoter = factory(root);
    }
}(this, function(global) {

    Object.filter = function( obj, predicate) {
        var result = {}, key;
        // ---------------^---- as noted by @CMS,
        //      always declare variables with the "var" keyword

        for (key in obj) {
            if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
                result[key] = obj[key];
            }
        }

        return result;
    };


    function Plasmid(target, options) {
        options = options || {};
        if (typeof target !== "object") {
            throw new Error("You can only operate on objects");
        }
        var _induced = {};
        var _exposed_functions = options.exposed || Object.keys(target);
        var _alloff = options.alloff || false;

        function write(p, value){


            // if ((_induced[p]!=null) && (typeof p === 'string'))
                _induced[p] = value;
        }

        function repress(p){
            args = Array.prototype.slice.call(arguments, 0);
            args.forEach(function(arg){
                write(arg,false);
            });
        }

        function induce(p){
            args = Array.prototype.slice.call(arguments, 0);
            args.forEach(function(arg){
                write(arg,true);
            });
        }

        function fill(value, predicate){
            for (promoter in _induced){

                _induced[promoter] =
                    predicate ? predicate(promoter) : value ;

            }

        }
        var _plasmid = {};
        _plasmid.ligate = function(promoter, gene/*function*/){
            //If all should be off(alloff === true) => then make this function the opposite of alloff
            _induced[promoter] = !_alloff;
            if ((!this[promoter])&&(typeof gene === 'function')){
                this[promoter] = function(){
                    args = Array.prototype.slice.call(arguments, 0);
                    if (_induced[promoter] === true) return gene.apply(target, args);
                };

            }
        };

        _plasmid.induce = function(){
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this, args);
        };

        _plasmid.repress = function(){
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this,args);
        };

        _plasmid.all = function(val){
            fill(val);
        };

        _plasmid.only = function(){
            fill(false);
            args = Array.prototype.slice.call(arguments,0);
            induce.apply(this,args);
        };

        _plasmid.except = function(){
            fill(true);
            args = Array.prototype.slice.call(arguments,0);
            repress.apply(this, args);
        };

        _plasmid.induced = function(){
            return Object.filter(_induced, function(promoter){
                return promoter == true;
            });
        };

        _plasmid.repressed = function(){
            return Object.filter(_induced, function(promoters){
                return !promoters;
            });
        };
        var self = this;
        _exposed_functions
        .forEach(function(func_name){
            _plasmid.ligate(func_name, target[func_name]);
        });
        return _plasmid;
    };
    return {
        Wrap: function(object, options){
            return new Plasmid(object, options);
        }
    };
}));
