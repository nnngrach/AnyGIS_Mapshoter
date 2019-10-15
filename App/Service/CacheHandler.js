const NodeCache = require( "node-cache" )

const storingTime = 3600 // 1 hour in seconds


const myCache = new NodeCache( { stdTTL: storingTime, checkperiod: storingTime + 60 } )


module.exports.save = function save(name, data) {
	const object = { isError: false, data: data}
	const isSuccess = myCache.set( name, object )
}



module.exports.load = function load(name) {

	try{
    	const object = myCache.get( name, true )
    	return object

	} catch( err ){
    	const errorObject = { isError: true, data: ""}
    	return errorObject
	}
}
