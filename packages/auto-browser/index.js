var AutoBrowser = require('./auto-browser');

/**
 * Declares AutoBrowser's exported functions, their input
 * and output types, as well as their names, and
 * other metadata that helps automata run most efficiently
 * to the Automata engine, the first time Automata encounters
 * the AutoBrowser plugin.
 */

function theInterface(set){
    packager.newPackage(
        {
            'name': 'AutoBrowser'

        }, function(set){

        set.begins('init', function(){

        });

        set.block('visit', function(block){
            block.takes.url();
            block.outputs(automata.boolean);
        });

        set.block('collect', function(block){
            block.takes(
                automata.array.contains(automata.string)
            );
        });

        set.block('click', function(block){
            block.takes(automata.string)
            block.outputs(automata.boolean);
        });

        set.block('enter', function(block){
            /*
             * Here is an example of a block that can handle more than one type of input
            */
            block.takes( automata.tuple.matches( [automata.string, automata.string] );
            block.takes( automata.hash.maps(automata.string, automata.string));

            block.outputs(automata.boolean);
        });

        /*
        set.block('...',...)
        */

    });
}

/**
 * Loads up an instance of the plugin by actually exporting
 * the functions declared by "declare"
 *
 */
function theImplementation(autobrowser){
    autobrowser('')
}

module.exports = {
    declare: theInterface,
    define: theImplementation
};
