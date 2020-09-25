/* eslint-disable no-console, import/no-nodejs-modules */
const WebSocket = require( 'ws' );

const wss = new WebSocket.Server( { port: 8080 } );

wss.on( 'connection', ( ws, request ) => {
	console.log( `Websocket request: `, request );
	ws.on( 'message', ( message ) => {
		console.log( `Received message => ${ message }` );
	} );
	ws.send( 'ho!' );
} );
