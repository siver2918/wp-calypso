/*
 * External dependencies
 */
const WebSocket = require( 'ws' );

/*
 * Internal dependencies
 */
const keychain = require( 'desktop/lib/keychain ' );
const log = require( 'desktop/lib/logger' )( 'api:pinghub' );
const { OAUTH_TOKEN } = require( 'desktop/lib/keychain/keys' );

/*
 * Module constants
 */
let wsInstance;
const pingMs = 30000; // Measured at ~27s

async function initWebSocket() {
	// TODO: Add retry attempts
	const token = await keychain.get( OAUTH_TOKEN );
	const ws = new WebSocket(
		'https://public-api.wordpress.com/pinghub/wpcom/me/newest-note-data',
		[],
		{
			headers: {
				Authorization: `Bearer ${ token }`,
			},
		}
	);

	ws.on( 'open', () => {
		log.info( 'Websocket connected' );
		heartbeat();
	} );

	ws.on( 'ping', () => {
		log.debug( 'Websocket ping' );
		heartbeat();
	} );

	ws.on( 'close', () => {
		log.info( 'Websocket disconnected' );
		clearTimeout( this.pingTimeout );
	} );

	ws.on( 'error', ( error ) => {
		log.info( 'Websocket error: ', error );
	} );

	ws.on( 'message', ( message ) => {
		log.debug( 'Received message: ', message );
	} );

	return ws;
}

function heartbeat() {
	clearTimeout( this.pingTimeout );

	this.pingTimeout = setTimeout( () => {
		wsInstance.terminate();
		wsInstance = initWebSocket();
		// timeout: server ping interval + conservative assumption of latency.
	}, pingMs + 1000 );
}

module.exports = {
	connect: ( handler ) => {
		if ( wsInstance ) {
			wsInstance.terminate();
			wsInstance = null;
		}
		wsInstance = initWebSocket( handler );
	},
	disconnect: () => {
		wsInstance && wsInstance.terminate();
		wsInstance = null;
	},
};
