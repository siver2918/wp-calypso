/*
 * External dependencies
 */
const keytar = require( 'keytar' );

/*
 * Module constants
 */
const keychainService = 'WordPress.com';

function set( key, value ) {
	return keytar.setPassword( keychainService, key, value );
}

function get( key ) {
	return keytar.getPassword( keychainService, key );
}

async function clear() {
	const credentials = await keytar.findCredentials( keychainService );
	if ( credentials && Array.isArray( credentials ) && credentials.length > 0 ) {
		for ( let i = 0; i < credentials.length; i++ ) {
			const key = credentials[ i ].account;
			await keytar.deletePassword( keychainService, key );
		}
	}
}

module.exports = {
	get,
	set,
	clear,
};
