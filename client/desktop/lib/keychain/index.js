/*
 * External dependencies
 */
const keytar = require( 'keytar' );

/*
 * Module constants
 */
const service = 'WordPress.com';

function set( key, value ) {
	return keytar.setPassword( service, key, value );
}

function get( key ) {
	return keytar.getPassword( service, key );
}

module.exports = {
	get,
	set,
};
