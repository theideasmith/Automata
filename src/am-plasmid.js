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

        if (typeof target !== "object") {
            throw new Error("You can only operate on objects");
        }
        var _induced = {};
        var _exposed_functions = options.exposed || Object.keys(target);
        var _alloff = options.alloff || false;

        function _plasmid(){
            var self = this;
            _exposed_functions
            .forEach(function(func_name){
                self.ligate(func_name, target[func_name]);
            });
        }

        function write(p, value){
            if (_induced[p] && (typeof p === 'string'))
                _induced[p] = value;
        }
        
        function _repress(p){
            write(p, false);
        }

        function induce(p){
            write(p,true);
        }

        function fill(value, predicate){
            for (promoter in _induced){

                _induced[promoter] =
                    predicate ? predicate(promoter) : value ;

            }

        }

        _plasmid.ligate = function(promoter, gene/*function*/){
            //If all should be off(alloff === true) => then make this function the opposite of alloff
            _induced[name] = !_alloff;

            if ((!this[promoter])&&(typeof gene === 'function')){
                this[promoter] = function(){
                    args = Array.prototype.slice.apply(arguments, 0);
                    if (_induced[promoter] === true) func.apply(target, args);
                };

            }
        };

        _plasmid.induce = function(promoter){

            if (typeof promoter == 'array'){
                promoter.forEach(induce);
            } else {
                induce(promoter);
            }
        };

        _plasmid.repress = function(promoter){

            if (typeof name == array){
                name.forEach(repress);
            } else {
                repress(promoter);
            }
        };

        _plasmid.all = function(val){
            fill(val);
        };

        _plasmid.only = function(){
            fill(false);
            args = Array.prototype.slice.apply(arguments,0);
            args.forEach(induce);
        };

        _plasmid.except = function(promoter){
            fill(true);
            args = Array.prototype.slice.apply(arguments,0);
            args.forEach(repress);
        };

        _plasmid.induced = function(){
            Object.filter(_induced, function(promoters){
                return promoters;
            });
        };

        _plasmid.repressed = function(){
            Object.filter(_induced, function(promoters){
                return !promoters;
            });
        };

        return _plasmid;
    };
    return {
        Wrap: function(object, options){
            return new Plasmid(object, options);
        }
    };
}));
