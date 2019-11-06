// Internal means of this node
// External means of other nodes

const fs = require("fs");

var fpath = module.filename;
// Module assumes this file is in the base directory of the program source

// This monstrosity gives you the folder containing this file
console.log( fpath.replace( /\w+\.\w+$/,"" ) );

class FileHashCollection{
    // String[] files
    // String basepath
    constructor( files, basepath ){
        constructor( files, basepath ){
            this.basepath = basepath ? basepath : fpath;
            this.hashes = this.hash( files );
            this.discrepencies = this.match( files );
        }
    }

    // String filepath
    add( filepath ){

    }

    // FileHashCollection fhcInternal
    hash( fhcInternal ){
        var self = this,
            hashes = files.map( ( file )=>{
                // Hash it please
            return fs.readFileSync( self.basepath + file ).toString();
        })
    }
}

/**
 * IntegrityCheceker should in theory only have access to files within the source folder
 */
class IntergityChecker{

    // FileHashCollection fhcInternalNode, fhcExternalNode
    static match( fhcInternalNode, fhcEexternalNode ){

    }
}