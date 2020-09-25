/* eslint-disable no-console, import/no-nodejs-modules */
const WebSocket = require( 'ws' );

const authToken = `${ process.env.OAUTH_TOKEN }`;

const ws = new WebSocket(
	'https://public-api.wordpress.com/pinghub/wpcom/me/newest-note-data',
	[],
	{
		headers: {
			Authorization: `Bearer ${ authToken }`,
		},
	}
);

ws.on( 'data', ( data ) => {
	console.log( 'Received data: ', data.toString() );
} );

ws.on( 'open', () => {
	console.log( 'Websocket connected!' );
} );

ws.on( 'close', () => {
	console.log( 'Websocket disconnected' );
} );

ws.on( 'message', ( data ) => {
	console.log( 'Received data: ', data );
} );

ws.on( 'error', ( error ) => {
	console.log( 'Websocket error: ', error );
} );

ws.on( 'ping', heartbeat );

function heartbeat() {
	clearTimeout( this.pingTimeout );

	this.pingTimeout = setTimeout( () => {
		this.terminate();
	}, 30000 + 1000 );
}
